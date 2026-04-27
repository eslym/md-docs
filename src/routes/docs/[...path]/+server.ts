import { posix, parse, join } from 'node:path';
import { cache_control, check_format, check_width, hbs_enabled } from './config';
import badRequestMd from './badrequest.md?raw';
import notFoundMd from './notfound.md?raw';
import serverError from './servererror.md.hbs';
import { lazy } from '$lib/lazy';
import { resolve } from '$lib/server/resolve';
import { version } from '$app/environment';
import { cached_file } from '$lib/server/cache';
import * as z from '$lib/zod';
import { docs_path } from '$lib/server/dir';
import sharp from 'sharp';
import { hash_file } from '$lib/server/hash';

export const trailingSlash = 'ignore';

const headers_init = z.loose(z.record(z.string(), z.string()), {} as Record<string, string>);

const http = lazy({
	badrequest: () =>
		new Response(badRequestMd, {
			status: 400,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8'
			}
		}),
	notfound: () =>
		new Response(notFoundMd, {
			status: 404,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8'
			}
		})
});

const hbs = /\.hbs$/i;

export async function GET({ url, params, request, locals }) {
	const path = posix.join('/', params.path);
	if (path.includes('/.') || hbs.test(path)) {
		return http.notfound;
	}
	const [found, resolved_path, absolute] = await resolve(path, {
		hbs: hbs_enabled
	});
	if (!found) {
		return http.notfound;
	}
	try {
		const headers = new Headers({
			'Content-Location': resolved_path
		});
		let file = Bun.file(absolute);
		let type = file.type;
		if (hbs.test(absolute)) {
			const prefix = Bun.hash.xxHash32(JSON.stringify(version + JSON.stringify(locals)));
			file = await cached_file(
				`hbs:${prefix}:${resolved_path}`,
				(cached) => cached.lastModified < file.lastModified,
				async () => Handlebars.compile(await file.text())(locals)
			);
			type = Bun.file(resolved_path).type;
		} else if (url.searchParams.has('w') || url.searchParams.has('f')) {
			let width = check_width.parse(url.searchParams.get('w'));
			let format = check_format.parse(url.searchParams.get('f'));
			if (!width && !format) {
				return http.badrequest;
			}
			await optimize(
				resolved_path,
				file,
				(optimized) => (file = optimized),
				headers,
				format,
				width
			);
		}

		const { base, dir } = parse(docs_path(resolved_path));
		const headers_file = Bun.file(join(dir, `.${base}.headers.json`));
		const custom_headers =
			headers_file.size > 0
				? await headers_file
						.json()
						.then((data) => headers_init.parse(data))
						.catch(() => ({}))
				: {};

		return etagged(
			file,
			request.headers.get('If-None-Match'),
			merge_headers(
				{
					'Content-Type': type,
					'Cache-Control': cache_control
				},
				custom_headers,
				headers
			)
		);
	} catch (err) {
		console.warn(`Error serving ${absolute}:`, err);
		const details = Bun.inspect(err, { colors: true });
		const content = serverError({ details });
		return new Response(content, {
			status: 500,
			headers: {
				'Content-Type': 'text/markdown; charset=utf-8'
			}
		});
	}
}

function merge_headers(...headers_list: HeadersInit[]) {
	const result = new Headers();
	for (const headers of headers_list) {
		for (const [key, value] of new Headers(headers)) {
			result.set(key, value);
		}
	}
	return result;
}

async function etagged(
	file: Bun.BunFile,
	expected: string | null | undefined,
	headers: HeadersInit
) {
	headers = new Headers(headers);
	const etag = `"${await hash_file(file)}"`;
	if (expected === etag) {
		return new Response(null, {
			status: 304,
			headers: {
				'Cache-Control': headers.get('cache-control') || cache_control,
				ETag: etag
			}
		});
	}
	headers.set('ETag', etag);
	return new Response(file, {
		headers: merge_headers(headers, {
			ETag: etag
		})
	});
}

async function optimize(
	path: string,
	file: Bun.BunFile,
	out: (file: Bun.BunFile) => void,
	headers: Headers,
	format: Exclude<z.infer<typeof check_format>, undefined> = 'auto',
	width: Exclude<z.infer<typeof check_width>, undefined> = 'auto'
) {
	const metadata = await sharp(await file.arrayBuffer()).metadata();
	if (format === 'auto' && metadata.format === 'svg') {
		// Don't try to rasterize SVGs if the client didn't explicitly request it
		return;
	}
	const key = `img:${format}:${width}:${Bun.SHA256.hash(file, 'hex')}:${path}`;
	const cached = await cached_file(
		key,
		(cached) => cached.lastModified < file.lastModified,
		async () => {
			const opt = sharp(await file.arrayBuffer()).rotate();
			if (format !== 'auto') {
				opt.toFormat(format);
			}
			if (width !== 'auto') {
				opt.resize({ width, withoutEnlargement: true });
			}
			return await opt.toBuffer();
		}
	);
	out(cached);
	if (format !== 'auto') {
		const { name } = parse(path);
		headers.set('Content-Type', `image/${format}`);
		headers.set('Content-Disposition', `inline; filename="${name}.${format}"`);
	}
}
