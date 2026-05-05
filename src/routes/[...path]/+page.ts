import { error } from '@sveltejs/kit';
import { ContentType } from '@remix-run/headers';
import { parseMarkdown } from '@eslym/markdown';
import { transform_nodes } from '$lib/markdown';
import { flatten_child_promise } from '$lib/promise';
import { mermaid } from '$lib/mermaid';
import { shiki } from '$lib/shiki';
import { version } from '$app/environment';

const xxhash32 = import.meta.env.SSR
	? async (str: string) => Bun.hash.xxHash32(str).toString(16).padStart(8, '0')
	: async (str: string) =>
			await import('xxh32').then((mod) => mod.xxh32(str).toString(16).padStart(8, '0'));

export async function load({ params, fetch, setHeaders }) {
	const resource_path = '/docs/' + params.path;
	const res = await fetch(resource_path);
	if (res.status === 400 || res.status === 404) {
		error(404);
	}
	const type = new ContentType(res.headers.get('Content-Type') || '');
	if (type.mediaType !== 'text/markdown') {
		error(404);
	}
	const doc_location = res.headers.get('content-location') || resource_path;
	const content = await res.text();
	const doc = transform_nodes(parseMarkdown(content, { syntax: { directive: true } }));
	const tools = await flatten_child_promise({
		mermaid: doc.languages.has('mermaid') ? mermaid() : undefined,
		shiki: doc.languages.size > 0 ? shiki(...doc.languages) : undefined
	});
	const headers: Record<string, string> = {};
	if (res.headers.has('cache-control')) {
		headers['Cache-Control'] = res.headers.get('cache-control') || '';
	}
	if (res.headers.has('etag')) {
		headers['Etag'] = JSON.stringify(await xxhash32(version + (res.headers.get('etag') || '')));
	}
	setHeaders(headers);
	return {
		loc: doc_location,
		doc,
		tools
	};
}
