import Sharp from 'sharp';
import { read } from '$app/server';
import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import * as process from 'node:process';
import { lazy } from '$lib/lazy';
import { docs_path } from '$lib/server/dir';

const started = Date.now();

type IconSource = {
	meta(): Promise<{ mtime: number; maxSize: number }>;
	resize(size: number): Promise<Uint8Array | ArrayBuffer>;
};

export function resolve_source(favicon: string, origin: string): IconSource {
	if (favicon.startsWith('data:')) {
		return resolve_data_uri(favicon);
	}
	if (!URL.canParse(favicon, origin)) {
		throw new Error(`Invalid favicon URL: ${favicon}`);
	}
	const url = new URL(favicon, origin);
	if (url.protocol === 'file:') {
		const path = decodeURIComponent(url.pathname);
		if (url.host === '.') {
			return resolve_with_file(join(process.cwd(), path));
		}
		return resolve_with_file(path);
	}
	if (url.origin === origin) {
		const pathname = decodeURIComponent(url.pathname);
		if (pathname.startsWith('/docs/')) {
			return resolve_with_file(docs_path(pathname.slice('/docs/'.length - 1)));
		}
		return resolve_with_response(read(pathname), started);
	}
	return resolve_with_fetch(url);
}

export function resolve_data_uri(uri: string): IconSource {
	const src = lazy({
		img: async () => {
			const res = await fetch(uri);
			if (!res.ok) {
				throw new Error(`Failed to fetch data URI: ${res.status} ${res.statusText}`);
			}
			return [await res.arrayBuffer(), started] as const;
		}
	});
	return resolve_with_getter(() => src.img);
}

export function resolve_with_file(path: string): IconSource {
	const src = lazy({
		img: async () => {
			const stats = await stat(path);
			if (!stats.isFile()) {
				throw new Error(`Path ${path} is not a file`);
			}
			const mtime = stats.mtimeMs;
			return [await Bun.file(path).arrayBuffer(), mtime] as const;
		}
	});
	return resolve_with_getter(() => src.img);
}

export function resolve_with_fetch(url: URL): IconSource {
	const src = lazy({
		img: async () => {
			const res = await fetch(url);
			if (!res.ok) {
				throw new Error(`Failed to fetch favicon: ${res.status} ${res.statusText}`);
			}
			const mtime = res.headers.get('last-modified');
			return [await res.arrayBuffer(), mtime ? new Date(mtime).getTime() : Date.now()] as const;
		}
	});
	return resolve_with_getter(() => src.img);
}

export function resolve_with_response(response: Response, mtime_override?: number): IconSource {
	const src = lazy({
		img: async () => {
			if (!response.ok) {
				throw new Error(`Failed to fetch favicon: ${response.status} ${response.statusText}`);
			}
			const mtime = response.headers.get('last-modified');
			return [
				await response.arrayBuffer(),
				mtime ? new Date(mtime).getTime() : (mtime_override ?? Date.now())
			] as const;
		}
	});
	return resolve_with_getter(() => src.img);
}

export function resolve_with_getter(
	src: () => Promise<readonly [string | Uint8Array | ArrayBuffer, number]>
) {
	async function meta() {
		const [buff, mtime] = await src();
		const metadata = await Sharp(buff).metadata();
		return {
			mtime,
			maxSize: metadata.format === 'svg' ? Infinity : Math.min(metadata.width, metadata.height)
		};
	}
	async function resize(size: number) {
		const [buff] = await src();
		return await Sharp(buff)
			.resize(size, size, {
				fit: 'inside',
				background: {
					r: 255,
					g: 255,
					b: 255,
					alpha: 0
				}
			})
			.png()
			.toBuffer();
	}
	return { meta, resize };
}
