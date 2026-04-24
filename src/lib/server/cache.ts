import { version } from '$app/environment';
import { env } from '$env/dynamic/public';
import { tmp_path } from '$lib/server/dir';
import { stat, mkdir, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const cache_key_seed: Uint8Array = Bun.SHA256.hash(
	JSON.stringify([Bun.version, version, env]),
	new Uint8Array(32)
) as Uint8Array;

function cache_key(path: string) {
	return Bun.SHA256.hash(Buffer.concat([Buffer.from(path), cache_key_seed]), 'hex');
}

async function atomic_write(file_path: string, data: string | Uint8Array | ArrayBuffer) {
	const write_path = `${file_path}.${Bun.randomUUIDv7()}`;
	await Bun.write(write_path, data);
	await rename(write_path, file_path);
}

async function cache_exists(key: string, ext: string) {
	const cache_dir = tmp_path(key.slice(0, 2), key);
	const cache_file_path = join(cache_dir, 'response' + ext);
	const cache_header_path = join(cache_dir, 'headers.json');
	const [cache_file_stat, cache_header_stat] = await Promise.all([
		stat(cache_file_path).catch(() => null),
		stat(cache_header_path).catch(() => null)
	]);
	return cache_file_stat?.isFile() && cache_header_stat?.isFile();
}

async function store_response<
	R extends Response & {
		metadata?: Record<string, any>;
	}
>(file_path: string, header_path: string, resolve: () => MaybePromise<R>) {
	const response = await resolve();
	const headers = Object.fromEntries(response.headers.entries());
	const metadata = response.metadata || null;
	await Promise.all([
		atomic_write(file_path, await response.arrayBuffer()),
		atomic_write(header_path, JSON.stringify({ headers, metadata }))
	]);
	return Object.assign(new Response(Bun.file(file_path), { headers }), { metadata }) as any;
}

export async function cached_response<
	R extends Response & {
		metadata?: Record<string, any>;
	}
>(
	id: string,
	ext: string,
	invalidated: (cached: R) => boolean,
	resolve: () => MaybePromise<R>
): Promise<R> {
	const key = cache_key(id);
	const cache_dir = tmp_path('res', key.slice(0, 2), key);
	await mkdir(cache_dir, { recursive: true });
	const cache_file_path = join(cache_dir, 'response' + ext);
	const cache_header_path = join(cache_dir, 'metadata.json');
	if (!(await cache_exists(key, ext))) {
		return store_response(cache_file_path, cache_header_path, resolve);
	}
	const { headers, metadata } = JSON.parse(await Bun.file(cache_header_path).text());
	const response = Object.assign(new Response(Bun.file(cache_file_path), { headers }), {
		metadata
	}) as any;
	if (invalidated(response)) {
		return store_response(cache_file_path, cache_header_path, resolve);
	}
	return response;
}

export async function clear_cache() {
	const check = await stat(tmp_path()).catch(() => null);
	if (!check) return;
	if (!check.isDirectory()) {
		throw new Error(`Cache path ${tmp_path()} exists but is not a directory`);
	}
	const glob = new Bun.Glob('**/*');
	for await (const file of glob.scan({ cwd: tmp_path(), absolute: true })) {
		await unlink(file);
	}
}
