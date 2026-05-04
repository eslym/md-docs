import { error } from '@sveltejs/kit';
import { ContentType } from '@remix-run/headers';
import { parseMarkdown } from '@eslym/markdown';
import { transform_nodes } from '$lib/markdown';
import { flatten_child_promise } from '$lib/promise';
import { mermaid } from '$lib/mermaid';
import { shiki } from '$lib/shiki';

export async function load({ params, fetch }) {
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
	return {
		loc: doc_location,
		doc,
		tools
	};
}
