import Sharp from 'sharp';
import { atomic_cache } from '$lib/server/cache';
import { docs_path } from '$lib/server/dir';
import { encode } from '$lib/msgpack';
import { is_format } from './config';
import { cache_headers, response_error } from './http';

export async function response_image(
	path: string,
	mtime: number,
	width_param: string | null,
	height_param: string | null,
	format: string | null
) {
	format = format ?? 'auto';
	if (!is_format(format)) {
		return response_error(400);
	}

	const width = width_param ? parseInt(width_param) : 'auto';
	if (width !== 'auto' && (isNaN(width) || width <= 0)) {
		return response_error(400);
	}

	const height = height_param ? parseInt(height_param) : 'auto';
	if (height !== 'auto' && (isNaN(height) || height <= 0)) {
		return response_error(400);
	}

	if (format === 'auto' && width === 'auto' && height === 'auto') {
		// no transformation needed, serve the original file with proper caching headers
		return new Response(Bun.file(docs_path(path)), {
			headers: {
				'Content-Type': Bun.file(docs_path(path)).type,
				...cache_headers(mtime)
			}
		});
	}

	const original_type = Bun.file(path).type;
	const cache_key = `image:${width}:${format}:${path}`;
	const cached = await atomic_cache(
		cache_key,
		async () => {
			const sharp = Sharp(await Bun.file(docs_path(path)).arrayBuffer());
			if (width !== 'auto' || height !== 'auto') {
				sharp.resize({
					width: width === 'auto' ? undefined : width,
					height: height === 'auto' ? undefined : height,
					fit: 'inside',
					background: {
						r: 255,
						g: 255,
						b: 255,
						alpha: 0
					}
				});
			}
			if (format !== 'auto') {
				sharp.toFormat(format);
			}
			return sharp.toBuffer();
		},
		mtime
	);

	return new Response(cached, {
		headers: {
			'Content-Type': format === 'auto' ? original_type : `image/${format}`,
			...cache_headers(mtime)
		}
	});
}

export async function response_dimension(path: string, mtime: number) {
	const file = await atomic_cache(
		`dimension:${path}`,
		async () => {
			const metadata = await Sharp(await Bun.file(docs_path(path)).arrayBuffer()).metadata();
			return encode({
				width: metadata.width,
				height: metadata.height
			});
		},
		mtime
	);

	return new Response(file, {
		headers: {
			'Content-Type': 'application/vnd+msgpack',
			...cache_headers(mtime)
		}
	});
}
