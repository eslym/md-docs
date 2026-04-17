import { version } from '$app/environment';
import { env } from '$env/dynamic/public';
import { tmp_path } from '$lib/server/dir';
import { stat, mkdir, rename, unlink } from 'node:fs/promises';
import { join } from 'node:path';

const caching = new Map<string, Promise<Bun.BunFile>>();

const cache_key_seed: Uint8Array = Bun.SHA256.hash(
	JSON.stringify([Bun.version, version, env]),
	new Uint8Array(32)
) as Uint8Array;

function cache_key(path: string) {
	return Bun.SHA256.hash(Buffer.concat([Buffer.from(path), cache_key_seed]), 'hex');
}

export function atomic_cache(
	path: string,
	create: () => MaybePromise<string | Buffer | Uint8Array>,
	mtime: number
) {
	const key = cache_key(path);
	if (caching.has(key)) {
		return caching.get(key)!;
	}
	const promise = Promise.resolve()
		.then(async () => {
			const dir = tmp_path(key.slice(0, 2));
			const check = await stat(dir).catch(() => null);
			if (!check) {
				await mkdir(dir, { recursive: true });
			} else if (!check.isDirectory()) {
				throw new Error(`Cache path ${dir} exists but is not a directory`);
			}
			const file = join(dir, key);
			const check_file = await stat(file).catch(() => null);
			if (check_file && check_file.mtimeMs >= mtime) {
				return Bun.file(file);
			}
			const atomic = `${file}.${Bun.hash.xxHash64(Date.now().toString())}`;
			await Bun.write(atomic, await create());
			await rename(atomic, file);
			return Bun.file(file);
		})
		.finally(() => {
			caching.delete(key);
		});
	caching.set(key, promise);
	return promise;
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
