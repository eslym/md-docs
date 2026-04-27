import { version } from '$app/environment';
import { tmp_path } from '$lib/server/dir';
import { stat, mkdir, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const cache_key_seed: Uint8Array = Bun.SHA256.hash(
	JSON.stringify([Bun.version, version]),
	new Uint8Array(32)
) as Uint8Array;

function cache_key(path: string) {
	return Bun.SHA256.hash(Buffer.concat([Buffer.from(path), cache_key_seed]), 'hex');
}

async function atomic_write(file_path: string, data: string | Uint8Array | ArrayBuffer) {
	const dir = join(file_path, '..');
	await mkdir(dir, { recursive: true });

	const write_path = join(dir, `.tmp-${Bun.randomUUIDv7()}`);

	try {
		await Bun.write(write_path, data);
		await rename(write_path, file_path);
	} catch (err) {
		await unlink(write_path).catch(() => {});
		throw err;
	}
}

export async function cached_file(
	id: string,
	invalidated: (cached: Bun.BunFile) => MaybePromise<boolean>,
	resolve: () => MaybePromise<string | Uint8Array | ArrayBuffer>
): Promise<Bun.BunFile> {
	const key = cache_key(id);
	const cache_file_path = tmp_path(key.slice(0, 2), key);
	const exists = await stat(cache_file_path)
		.then((s) => s.isFile())
		.catch(() => false);
	if (!exists) {
		const data = await resolve();
		await atomic_write(cache_file_path, data);
		return Bun.file(cache_file_path);
	}
	const cached_file = Bun.file(cache_file_path);
	if (await invalidated(cached_file)) {
		const data = await resolve();
		await atomic_write(cache_file_path, data);
		return Bun.file(cache_file_path);
	}
	return cached_file;
}

export async function clear_cache() {
	const check = await stat(tmp_path()).catch(() => null);
	if (!check) return;
	if (!check.isDirectory()) {
		throw new Error(`Cache path ${tmp_path()} exists but is not a directory`);
	}
	const glob = new Bun.Glob('**/*');
	for await (const file of glob.scan({
		cwd: tmp_path(),
		dot: true,
		absolute: true,
		onlyFiles: true
	})) {
		await unlink(file);
	}
}
