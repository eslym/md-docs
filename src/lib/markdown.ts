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
			return ctx.remove();
		}
	});
	walker.on('enter', 'code', (node) => {
		languages.add(node.lang ?? 'text');
	});
	walker.on('exit', 'containerDirective', (node, ctx) => {
		if (node.name === 'tabs') {
			const result = transform_tabs(node);
			if (result) {
				return ctx.replaceWith(result);
			}
		}
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

function transform_tabs(node: MD.ContainerDirective): MD.TabList | null {
	const headings: MD.Heading[] = [];
	let lowestDepth = Infinity;

	for (const child of node.children) {
		if (child.type === 'heading') {
			headings.push(child);
			if (child.depth < lowestDepth) {
				lowestDepth = child.depth;
			}
		}
	}

	if (headings.length === 0) {
		return null;
	}

	const tabs: MD.Tab[] = [];
	for (const child of node.children) {
		if (child.type === 'heading' && child.depth === lowestDepth) {
			const title = collectText(child);
			const tab: MD.Tab = {
				type: 'tab',
				id: child.id,
				title,
				children: [],
				pos: child.pos
			};
			tabs.push(tab);
			continue;
		}
		const last = tabs.at(-1);
		if (!last) continue;
		last.children.push(child);
		if (last.pos && child.pos) {
			last.pos[1] = child.pos[1];
		}
	}
	return {
		type: 'tablist',
		children: tabs,
		storage: node.attributes?.['storage'],
		key: node.attributes?.['key'],
		pos: node.pos
	};
}
