import { join } from 'node:path';
import { stat } from 'node:fs/promises';
import { docs_path } from '$lib/server/dir';

export async function resolve(path: string) {
	const candidates = path.endsWith('/')
		? [join(path, 'index.md')]
		: [path, path + '.md', join(path, 'index.md')];

	for (const checkpath of new Set(candidates)) {
		const filepath = docs_path(checkpath);
		try {
			const file_stat = await stat(filepath);
			if (file_stat.isFile()) {
				return [true, checkpath, filepath, Math.floor(file_stat.mtimeMs / 1000) * 1000] as const;
			}
		} catch {
			continue;
		}
	}

	return [false, '', '', 0] as const;
}
