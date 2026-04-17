import { collect_text, decompress_mdast, walk_mdast, type TOCEntry } from '$lib/markdown';
import { mermaid } from '$lib/mermaid';
import { get_msgpack_data } from '$lib/msgpack';
import { flatten_child_promise } from '$lib/promise';
import type { MarkdownMeta } from '$lib/server/markdown';
import { shiki } from '$lib/shiki';
import { optimizable } from '$lib/url';
import { error } from '@sveltejs/kit';

export async function load({ params, fetch, url }) {
	const res = await fetch('/docs/' + params.path + '?type=mdast');
	if (res.status === 400 || res.status === 404) {
		error(404);
	}
	if (!res.ok) {
		error(500, await res.json().catch(() => 'An unknown error occurred'));
	}
	const [_, loc, meta, mdast] =
		await get_msgpack_data<[rev: bigint, loc: string, meta: MarkdownMeta, mdast: unknown[]]>(res);
	const root = decompress_mdast(mdast);

	const toc_stack: TOCEntry[] = [{ text: ':root:', children: [] }];
	const code: Set<string> = new Set();
	const optimizable_images: Set<string> = new Set();

	const base = new URL(loc, url);

	walk_mdast(root, (node) => {
		switch (node.type) {
			case 'heading':
				{
					const parent = toc_stack[node.level - 1];
					if (!parent) return;
					const entry: TOCEntry = { text: collect_text(node.children), id: node.id };
					(parent.children ??= []).push(entry);
					toc_stack[node.level] = entry;
				}
				break;
			case 'code':
				code.add(node.lang || 'text');
				break;
			case 'image':
				{
					if (URL.canParse(node.src, base)) {
						const img_url = new URL(node.src, base);
						if (optimizable(img_url, base)) {
							optimizable_images.add(decodeURIComponent(img_url.pathname));
						}
					}
				}
				break;
		}
	});

	const extras = await flatten_child_promise({
		images: image_dimensions(optimizable_images, fetch),
		tools: flatten_child_promise({
			shiki: load_shiki(code, meta.markdown?.render?.highlight ?? true),
			mermaid: load_mermaid(code, meta.markdown?.render?.mermaid ?? true)
		})
	});

	return {
		loc,
		meta,
		doc: {
			toc: toc_stack[0].children!,
			root
		},
		...extras
	};
}

async function load_shiki(code: Set<string>, enabled: boolean) {
	if (!enabled || !code.size) return undefined;
	const instance = await shiki(...code);
	return instance;
}

async function load_mermaid(code: Set<string>, enabled: boolean) {
	if (!enabled || !code.has('mermaid')) return undefined;
	const instance = await mermaid();
	return instance;
}

async function image_dimensions(images: Set<string>, fetch: typeof globalThis.fetch) {
	return new Map(
		(
			await Promise.all(
				[...images].map(async (path) => {
					const dimension = await fetch_dimension(path, fetch);
					return [path, dimension] as const;
				})
			)
		).filter(
			(([, dimension]) => dimension !== null) as (
				arg: any
			) => arg is [string, { width: number; height: number }]
		)
	);
}

async function fetch_dimension(path: string, fetch: typeof globalThis.fetch) {
	const res = await fetch(path + '?type=dimension');
	if (!res.ok) {
		return null;
	}
	try {
		return await get_msgpack_data<{ width: number; height: number }>(res);
	} catch (e) {
		console.warn(`Failed to get dimension for ${path}:`, e);
		return null;
	}
}
