import { error } from '@sveltejs/kit';
import { ContentType } from '@remix-run/headers';

export async function load({ params, fetch, url }) {
	const res = await fetch('/docs/' + params.path);
	if (res.status === 400 || res.status === 404) {
		error(404);
	}
	const type = new ContentType(res.headers.get('Content-Type') || '');
	if (type.mediaType !== 'text/markdown') {
		error(404);
	}
}
