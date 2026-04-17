/// <reference types="bun"/>
import { collect_text } from '$lib/markdown';
import { SAXParser } from 'parse5-sax-parser';

const self_closing = new Set([
	'area',
	'base',
	'br',
	'col',
	'embed',
	'hr',
	'img',
	'input',
	'link',
	'meta',
	'param',
	'source',
	'track',
	'wbr'
]);

type TextNode = {
	type: 'text';
	value: string;
};

type CodeNode = {
	type: 'code';
	value: string;
	lang?: string;
};

type HTMLNode = {
	type: 'html';
	tag: string;
	attrs: [name: string, value: string][];
	children: MarkdownNode[];
};

type CodespanNode = {
	type: 'codespan';
	value: string;
};

type CommentNode = {
	type: 'comment';
	value: string;
};

type ImageNode = {
	type: 'image';
	src: string;
	alt: string;
	title?: string;
};

type PartialHTMLNode =
	| {
			type: 'html-open';
			tag: string;
			attrs: [name: string, value: string][];
	  }
	| {
			type: 'html-close';
			tag: string;
			raw: string;
	  };

export type MarkdownDocument = MarkdownNode[];

type C = Omit<
	Required<Bun.markdown.RenderCallbacks>,
	'text' | 'code' | 'html' | 'codespan' | 'image'
>;

export type MarkdownNodeMap = {
	[K in keyof C]: Prettify<
		{
			type: K;
			children: MarkdownNode[];
		} & (Parameters<C[K]>['length'] extends 1 ? {} : Parameters<C[K]>[1])
	>;
} & {
	text: TextNode;
	codespan: CodespanNode;
	code: CodeNode;
	image: ImageNode;
	html: HTMLNode;
	comment: CommentNode;
};

export type MarkdownNode = MarkdownNodeMap[keyof MarkdownNodeMap];

function map_children(children: string, indices: (MarkdownNode | PartialHTMLNode)[]) {
	const stack: HTMLNode[] = [{ children: [] } as any];
	for (const part of children.split(/:/).slice(1)) {
		const i = Number.parseInt(part);
		const node = indices[i];
		const current = stack.at(-1)!;
		switch (node.type) {
			case 'html-open':
				{
					const html: HTMLNode = {
						type: 'html',
						tag: node.tag,
						attrs: node.attrs,
						children: []
					};
					current.children.push(html);
					if (!self_closing.has(node.tag)) {
						stack.push(html);
					}
				}
				break;
			case 'html-close':
				{
					if (current.tag === node.tag) {
						stack.pop();
					} else {
						const text: TextNode = {
							type: 'text',
							value: node.raw
						};
						const last = current.children.at(-1);
						if (last?.type === 'text') {
							last.value += text.value;
						} else {
							current.children.push(text);
						}
					}
				}
				break;
			case 'text':
				{
					const last = current.children.at(-1);
					if (last?.type === 'text') {
						last.value += node.value;
					} else {
						current.children.push(node);
					}
				}
				break;
			default:
				current.children.push(node);
		}
	}
	return stack[0].children;
}

export function parse_markdown(
	markdown: string,
	options: Bun.markdown.Options & {
		omitComments?: boolean;
	} = {}
): MarkdownDocument {
	const { omitComments: omit_comments = false, ...markdown_options } = options;
	const all_nodes: (MarkdownNode | PartialHTMLNode)[] = [];
	const node_indices = new Map<MarkdownNode | PartialHTMLNode, number>();
	function push(node: MarkdownNode | PartialHTMLNode) {
		const id = all_nodes.length;
		all_nodes.push(node);
		node_indices.set(node, id);
		return `:${id}`;
	}
	const code_languages = new Set<string>();
	const callbacks = new Proxy(
		{
			heading(children: string, { level, id }: Bun.markdown.HeadingMeta) {
				const node = {
					type: 'heading',
					children: map_children(children, all_nodes),
					level,
					id
				} satisfies MarkdownNode;
				return push(node);
			},
			text(value: string) {
				const node = { type: 'text', value } satisfies TextNode;
				return push(node);
			},
			codespan(children: string) {
				const value = collect_text(map_children(children, all_nodes));
				const node = { type: 'codespan', value } satisfies CodespanNode;
				return push(node);
			},
			image(children: string, meta: Bun.markdown.ImageMeta) {
				const alt = collect_text(map_children(children, all_nodes));
				const node = {
					type: 'image',
					src: meta.src,
					alt,
					title: meta.title
				} satisfies ImageNode;
				return push(node);
			},
			code(children: string, { language }: { language?: string } = {}) {
				const node = {
					type: 'code',
					value: collect_text(map_children(children, all_nodes)),
					lang: language
				} satisfies CodeNode;
				return push(node);
			},
			html(child_string: string) {
				const children = map_children(child_string, all_nodes) as TextNode[];
				const text = children.map((child) => child.value).join('');
				const parser = new SAXParser({ sourceCodeLocationInfo: true });
				let tags = '';
				parser.on('startTag', (tag) => {
					const attrs = tag.attrs.map(
						(attr) =>
							[attr.namespace ? `${attr.prefix}:${attr.name}` : attr.name, attr.value] as [
								string,
								string
							]
					);
					const node: PartialHTMLNode = {
						type: 'html-open',
						tag: tag.tagName,
						attrs
					};
					tags += push(node);
				});
				parser.on('text', (text) => {
					const node = { type: 'text', value: text.text } satisfies TextNode;
					tags += push(node);
				});
				parser.on('endTag', (tag) => {
					const start = tag.sourceCodeLocation!.startOffset;
					const end = tag.sourceCodeLocation!.endOffset;
					const node: PartialHTMLNode = {
						type: 'html-close',
						tag: tag.tagName,
						raw: child_string.substring(start, end)
					};
					tags += push(node);
				});
				parser.on('doctype', (doctype) => {
					const start = doctype.sourceCodeLocation!.startOffset;
					const end = doctype.sourceCodeLocation!.endOffset;
					const node: TextNode = {
						type: 'text',
						value: child_string.substring(start, end)
					};
					tags += push(node);
				});
				parser.on('comment', (comment) => {
					if (omit_comments) return;
					const node: CommentNode = {
						type: 'comment',
						value: comment.text
					};
					tags += push(node);
				});
				parser.write(text);
				parser.end();
				return tags;
			}
		} as any,
		{
			get(target, prop) {
				if (Reflect.has(target, prop)) {
					return Reflect.get(target, prop);
				}
				return (target[prop] = (children: string, meta: any) => {
					const node = {
						type: prop,
						children: map_children(children, all_nodes),
						...meta
					} satisfies any;
					return push(node);
				});
			}
		}
	);
	const root = Bun.markdown.render(markdown, callbacks, markdown_options);
	return map_children(root, all_nodes);
}
