import { extname } from 'node:path';
import Handlebars from 'handlebars';
import { atomic_cache } from '$lib/server/cache';
import { docs_path } from '$lib/server/dir';
import { encode } from '$lib/msgpack';
import { env } from './config';

export function cached_text(path: string, mtime: number, substitute = false) {
	if (!substitute) {
		return Bun.file(docs_path(path));
	}

	return atomic_cache(
		'text:' + path,
		async () => {
			const text = await Bun.file(docs_path(path)).text();
			return Handlebars.compile(text)({ env, vars: {} });
		},
		mtime
	);
}

export const adapters = {
	'.yml': Bun.YAML.parse,
	'.yaml': Bun.YAML.parse,
	'.json': JSON.parse
} as Record<string, (text: string) => unknown>;

export function cached_data(path: string, mtime: number, substitute = false) {
	return atomic_cache(
		'data:' + path,
		async () => {
			const ext = extname(path).toLowerCase();
			const adapter = adapters[ext];
			const file = await cached_text(path, mtime, substitute);
			const text = await file.text();
			const data = adapter(text);
			return encode(data);
		},
		mtime
	);
}
