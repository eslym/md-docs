import { lazy, lazy_array } from '$lib/lazy';
import type { MarkdownDocument, MarkdownNode, MarkdownNodeMap } from '$lib/server/markdown';

type UnionToIntersection<U> = (U extends any ? (k: U) => void : never) extends (k: infer I) => void
	? I
	: never;

type LastInUnion<U> =
	UnionToIntersection<U extends any ? (x: U) => 0 : never> extends (x: infer L) => 0 ? L : never;

type UnionToTuple<U, Last = LastInUnion<U>> = [U] extends [never]
	? []
	: [...UnionToTuple<Exclude<U, Last>>, Last];

type SameLength<T extends any[]> = T[number][] & { length: T['length'] };

type NotEmpty<T extends any[]> = T extends [] ? never : T;

type FilterNever<T> = {
	[K in keyof T as T[K] extends never ? never : K]: T[K];
};

type Shape = FilterNever<
	Prettify<{
		[K in keyof MarkdownNodeMap]: NotEmpty<
			SameLength<UnionToTuple<keyof Omit<MarkdownNodeMap[K], 'type' | 'children'>>>
		>;
	}>
>;

export interface TOCEntry {
	text: string;
	id?: string;
	children?: TOCEntry[];
}

const types = [
	'text',
	'code',
	'html',
	'codespan',
	'image',
	'heading',
	'paragraph',
	'blockquote',
	'list',
	'listItem',
	'hr',
	'table',
	'thead',
	'tbody',
	'tr',
	'th',
	'td',
	'strong',
	'emphasis',
	'link',
	'strikethrough',
	'comment'
] satisfies SameLength<UnionToTuple<keyof MarkdownNodeMap>>;

const shapes = {
	heading: ['level', 'id'],
	list: ['ordered', 'start', 'depth'],
	listItem: ['ordered', 'start', 'depth', 'index', 'checked'],
	th: ['align'],
	td: ['align'],
	link: ['href', 'title'],
	text: ['value'],
	codespan: ['value'],
	code: ['value', 'lang'],
	image: ['src', 'alt', 'title'],
	html: ['tag', 'attrs'],
	comment: ['value']
} satisfies Shape;

const transformers: Record<
	string,
	{
		encode: (value: any) => any;
		decode: (value: any) => any;
	}
> = {
	align: {
		encode(align: 'left' | 'right' | 'center' | undefined): 'l' | 'r' | 'c' | undefined {
			return align?.[0] as any;
		},
		decode(align: 'l' | 'r' | 'c' | undefined): 'left' | 'right' | 'center' | undefined {
			if (!align) return undefined;
			return {
				l: 'left',
				r: 'right',
				c: 'center'
			}[align] as any;
		}
	}
};

function compress_node(node: MarkdownNode): any[] {
	const c: any[] = [
		types.indexOf(node.type),
		'children' in node ? node.children.map((child) => compress_node(child)) : undefined
	];
	const shape = shapes[node.type as keyof Shape];
	if (shape) {
		for (const key of shape) {
			if (transformers[key]) {
				c.push(transformers[key].encode((node as any)[key] ?? undefined));
			} else {
				c.push((node as any)[key] ?? undefined);
			}
		}
	}
	return c;
}

const src_symbol = Symbol('src');

function arr_proxy(arr: any[]): any {
	const proxy = lazy_array(arr.map(() => (i) => node_proxy(arr[i]))) as any;
	return proxy;
}

function node_proxy(node: any[]): any {
	const accessors = [
		[src_symbol, () => node],
		['type', () => types[node[0]]],
		['children', () => (node[1] ? arr_proxy(node[1]) : undefined)]
	];
	const shape = shapes[types[node[0]] as keyof Shape];
	if (shape) {
		for (let i = 0; i < shape.length; i++) {
			const index = 2 + i;
			accessors.push([
				shape[i],
				transformers[shape[i]]
					? () => transformers[shape[i]].decode(node[index])
					: () => node[index]
			]);
		}
	}
	return lazy(Object.fromEntries(accessors) as any);
}

export function compress_mdast(doc: MarkdownDocument): any[] {
	return doc.map((node) => compress_node(node));
}

export function decompress_mdast(data: any[]): MarkdownDocument {
	return arr_proxy(data);
}

export function collect_text(node: MarkdownNode[]): string {
	return node
		.map((child) => {
			if (child.type === 'text' || child.type === 'codespan') {
				return child.value;
			}
			if (child.type === 'image') {
				return child.alt;
			}
			if (child.type === 'comment') {
				return '';
			}
			if (child.type === 'html') {
				if (child.tag === 'img') {
					const alt = child.attrs.find(([name]) => name === 'alt')?.[1];
					if (alt) {
						return alt;
					}
				}
			}
			if ('children' in child && child.children?.length) {
				return collect_text(child.children!);
			}
			return '';
		})
		.join('');
}

export function walk_mdast(
	nodes: MarkdownNode[],
	enter: (node: MarkdownNode) => void,
	out?: (node: MarkdownNode) => void
) {
	for (const node of nodes) {
		enter(node);
		if ('children' in node && node.children?.length) {
			walk_mdast(node.children, enter, out);
		}
		out?.(node);
	}
}
