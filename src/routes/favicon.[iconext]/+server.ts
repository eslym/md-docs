import { read } from '$app/server';
import faviconSvg from '$lib/assets/favicon.svg';
import { cached_file } from '$lib/server/cache';
import { docs_path } from '$lib/server/dir';
import { join } from 'path';
import sharp from 'sharp';
import * as z from '$lib/zod';

const start = Date.now();

const ico_sizes = [16, 32, 48, 64];

const size_icondir = 2 * 3; // ICONDIR (uint16 + uint16 + uint16)
const size_icondirentry = 16; // ICONDIRENTRY (uint8 * 4 + uint16 * 2 + uint32)

export async function GET({ locals, url, params }) {
	const ext = params.iconext;
	const src = await resolve_source(locals.app.favicon, url);
	if (ext === 'ico') {
		return new Response(await build_icon_ico(locals.app.favicon, src[0], src[1]), {
			headers: {
				'Content-Type': 'image/x-icon'
			}
		});
	}
	const size = z
		.loose(z.coerce.integer().check(z.minimum(1)), 64)
		.parse(url.searchParams.get('size'));
	return new Response(await build_icon_png(locals.app.favicon, src[0], src[1], size), {
		headers: {
			'Content-Type': 'image/png'
		}
	});
}

async function build_icon_ico(
	key: string,
	src: () => MaybePromise<Blob>,
	mtime: number
): Promise<Bun.BunFile> {
	return await cached_file(
		`favicon:ico:${key}`,
		(cached) => cached.lastModified < mtime,
		async () => {
			const icons = await Promise.all(
				ico_sizes.map((size) =>
					build_icon_png(key, src, mtime, size).then(
						async (file) => [await file.bytes(), size] as const
					)
				)
			);
			const header_size = size_icondir + size_icondirentry * icons.length;
			const header = new Uint8Array(header_size);
			const view = new DataView(header.buffer);
			view.setUint16(0, 0, true); // Reserved
			view.setUint16(2, 1, true);
			view.setUint16(4, icons.length, true); // Number of images
			let offset = header_size;
			for (let i = 0; i < icons.length; i++) {
				const [buffer, size] = icons[i];
				const entry_offset = size_icondir + i * size_icondirentry;
				header[entry_offset] = size; // Width
				header[entry_offset + 1] = size; // Height
				header[entry_offset + 2] = 0; // Color palette
				header[entry_offset + 3] = 0; // Reserved
				view.setUint16(entry_offset + 4, 1, true); // Color planes
				view.setUint16(entry_offset + 6, 32, true); // Bits per pixel
				view.setUint32(entry_offset + 8, buffer.byteLength, true); // Image data size
				view.setUint32(entry_offset + 12, offset, true); // Image data offset
				offset += buffer.byteLength;
			}
			return Buffer.concat([header, ...icons.map(([buffer]) => buffer)]);
		}
	);
}

async function build_icon_png(
	key: string,
	src: () => MaybePromise<Blob>,
	mtime: number,
	size: number
): Promise<Bun.BunFile> {
	return await cached_file(
		`favicon:png:${size}:${key}`,
		(cached) => cached.lastModified < mtime,
		async () => {
			const blob = await src();
			const buffer = await blob.arrayBuffer();
			return await sharp(buffer)
				.resize({
					width: size,
					height: size,
					fit: 'inside',
					background: { r: 0, g: 0, b: 0, alpha: 0 }
				})
				.png()
				.toBuffer();
		}
	);
}

async function resolve_source(
	src: string,
	origin: URL
): Promise<[src: () => MaybePromise<Blob>, mtime: number]> {
	if (src.startsWith('data:')) {
		return [() => read(src).blob(), start];
	}
	if (!URL.canParse(src, origin)) {
		return [() => read(faviconSvg).blob(), start];
	}
	const url = new URL(src, origin);
	const pathname = decodeURIComponent(url.pathname);
	if (url.origin === origin.origin) {
		if (!pathname.startsWith('/docs/')) {
			return [() => read(faviconSvg).blob(), start];
		}
		return [() => Bun.file(docs_path(pathname.slice(5))), start];
	}
	if (url.protocol === 'file:') {
		const filepath = url.host === '.' ? join(process.cwd(), pathname) : pathname;
		const file = Bun.file(filepath);
		return [() => file, file.lastModified];
	}
	if (url.protocol !== 'http:' && url.protocol !== 'https:') {
		return [() => read(faviconSvg).blob(), start];
	}
	const response = await fetch(url.href);
	if (!response.ok) {
		return [() => read(faviconSvg).blob(), start];
	}
	const mtime = response.headers.get('last-modified')
		? new Date(response.headers.get('last-modified')!).getTime()
		: Infinity;
	return [() => response.blob(), mtime];
}
