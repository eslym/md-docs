import { collectText, type MD, NodeWalker } from '@eslym/markdown';
import { slug } from 'github-slugger';
import { parse } from 'yaml';
import * as z from '$lib/zod';

const _schema = z.object({
	title: z.optional(z.loose(z.string())),
	description: z.optional(z.loose(z.string())),
	toc: z.optional(
		z.loose(
			z.union([
				z.boolean(),
				z.object({
					startDepth: z.number().check(z.int(), z.minimum(1), z.maximum(6))
				})
			])
		)
	)
});

const markdown_meta_schema = z.loose(_schema, {} as z.infer<typeof _schema>);

export class Slugger {
	#occurrences: Record<string, number> = {};

	slug(value: string) {
		const base = slug(value);
		const count = this.touch(base);
		const id = count === 1 ? base : `${base}-${count}`;
		this.touch(id);
		return id;
	}

	touch(value: string) {
		let n = (this.#occurrences[value] ?? 0) + 1;
		while (this.#occurrences[`${value}-${n}`]) {
			n++;
		}
		return (this.#occurrences[value] = n);
	}
}

export function transform_nodes(doc: MD.Document) {
	const slugger = new Slugger();
	const walker = new NodeWalker();
	const meta = markdown_meta_schema.parse(parse(doc.meta ?? ''));
	const languages = new Set<string>();

	for (const footnote of Object.values(doc.footnotes ?? {})) {
		footnote.domId = slugger.slug(`note ${footnote.identifier}`);
		footnote.linkId = slugger.slug(`note ref ${footnote.identifier}`);
		insert_back_ref(footnote);
	}

	walker.on('enter', 'heading', (node) => {
		if (typeof meta.title === 'undefined' && node.depth === 1) {
			meta.title = strip_whitespace(collectText(node));
		}
		node.id = determine_id(node, slugger);
	});
	walker.on('enter', 'textDirective', (node, ctx) => {
		if (node.name === 'setId') {
			if (node.children.length) {
				return ctx.replaceWith(node.children);
			} else {
				return ctx.remove();
			}
		}
	});
	walker.on('enter', 'element', (node) => {
		if (node.properties?.id) {
			// Touch the ID to ensure it won't be used for auto-generated headings
			slugger.touch(node.properties.id);
		}
	});
	walker.on('enter', 'containerDirective', (node, ctx) => {
		if (node.name === 'description') {
			if (typeof meta.description === 'undefined') {
				meta.description = strip_whitespace(collectText(node));
			}
			if (node.children.length) {
				return ctx.replaceWith(node.children);
			}
			return ctx.remove();
		}
	});
	walker.on('enter', 'footnoteReference', (node, ctx) => {
		const def = doc.footnotes?.[node.identifier];
		if (!def) {
			return ctx.remove();
		}
		node.domId = def.linkId;
		node.linkId = def.domId;
	});
	walker.on('enter', 'code', (node) => {
		languages.add(node.lang ?? 'text');
	});
	walker.on('exit', 'text', (node, ctx) => {
		if (ctx.previousSibling?.type === 'text') {
			ctx.previousSibling.value += node.value;
			if (ctx.previousSibling.pos && node.pos) {
				ctx.previousSibling.pos[1] = node.pos[1];
			}
			return ctx.remove();
		}
	});
	return walker.execute(doc);
}

function determine_id(node: MD.Heading, slugger: Slugger) {
	for (const child of node.children) {
		if (child.type === 'textDirective' && child.name === 'setId' && child.attributes?.['id']) {
			slugger.touch(child.attributes['id']);
			return child.attributes['id'];
		}
	}
	const text = collectText(node);
	return slugger.slug(text);
}

function strip_whitespace(value: string) {
	return value.trim().replace(/\s+/g, ' ');
}

function insert_back_ref(def: MD.FootnoteDefinition) {
	if (!def.linkId) {
		return;
	}
	const back_ref: MD.FootnoteBackRef = {
		type: 'footnoteBackRef',
		id: def.linkId
	};
	const walker = new NodeWalker();
	let last_paragraph: MD.Paragraph = null!;
	walker.on('enter', 'paragraph', (node) => {
		last_paragraph = node;
	});
	walker.execute(def);
	if (last_paragraph) {
		last_paragraph.children.push(back_ref);
	} else {
		def.children.push(back_ref);
	}
}
