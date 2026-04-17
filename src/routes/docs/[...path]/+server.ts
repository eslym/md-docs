import { extname, posix } from 'node:path';
import {
	cache_control,
	should_substitute_html,
	should_substitute_json,
	should_substitute_yaml
} from './config';
import { cached_data, cached_text, adapters } from './data';
import { response_dimension, response_image } from './image';
import { if_modified_since, response_error, cache_headers } from './http';
import { response_markdown, response_mdast } from './markdown';
import { resolve } from './resolve';

export const trailingSlash = 'ignore';

export async function GET({ url, params, request }) {
	const path = posix.join('/', params.path);
	if (path.includes('/.')) {
		return response_error(404);
	}
	const [found, resolved_path, filepath, mtime] = await resolve(path);
	if (!found) {
		return response_error(404);
	}
	try {
		const ext = extname(filepath).toLowerCase();
		const type = url.searchParams.get('type');
		const client_last_modified = if_modified_since(request);
		if (mtime <= client_last_modified) {
			return new Response(null, {
				status: 304,
				headers: {
					'Cache-Control': cache_control
				}
			});
		}
		if (type === 'mdast') {
			if (ext !== '.md') {
				return response_error(400);
			}
			return response_mdast(resolved_path, mtime);
		}
		if (type === 'data') {
			if (adapters[ext]) {
				const file = await cached_data(
					resolved_path,
					mtime,
					ext === '.json' ? should_substitute_json : should_substitute_yaml
				);
				return new Response(file, {
					headers: {
						'Content-Type': 'application/vnd+msgpack',
						...cache_headers(mtime)
					}
				});
			} else {
				return response_error(400);
			}
		}
		if (type === 'dimension') {
			if (ext === '.svg' || !Bun.file(filepath).type.startsWith('image/')) {
				return response_error(400);
			}
			return response_dimension(resolved_path, mtime);
		}
		if (ext === '.md') {
			return response_markdown(resolved_path, mtime);
		} else if (ext === '.json') {
			const file = await cached_text(resolved_path, mtime, should_substitute_json);
			return new Response(file, {
				headers: {
					'Content-Type': 'application/json; charset=utf-8',
					...cache_headers(mtime)
				}
			});
		} else if (ext === '.yml' || ext === '.yaml') {
			const file = await cached_text(resolved_path, mtime, should_substitute_yaml);
			return new Response(file, {
				headers: {
					'Content-Type': 'text/yaml; charset=utf-8',
					...cache_headers(mtime)
				}
			});
		} else if (ext === '.html') {
			const file = await cached_text(resolved_path, mtime, should_substitute_html);
			return new Response(file, {
				headers: {
					'Content-Type': 'text/html; charset=utf-8',
					...cache_headers(mtime)
				}
			});
		}
		const file = Bun.file(filepath);
		if (
			file.type.startsWith('image/') &&
			(url.searchParams.has('w') || url.searchParams.has('h') || url.searchParams.has('f'))
		) {
			return response_image(
				resolved_path,
				mtime,
				url.searchParams.get('w'),
				url.searchParams.get('h'),
				url.searchParams.get('f')
			);
		}
		return new Response(file, {
			headers: cache_headers(mtime)
		});
	} catch (err) {
		console.error(err);
		const inspect = Bun.inspect(err, { colors: true });
		return Response.json(
			{
				error: '500 Internal Server error',
				details: inspect
			},
			{
				status: 500,
				headers: { 'Content-Type': 'application/json; charset=utf-8' }
			}
		);
	}
}
