import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { name } from '../../../package.json';
import { env } from '$env/dynamic/private';

export const tmp_path = join.bind(null, env.TEMP_DIR || join(tmpdir(), name));

export const docs_path = join.bind(
	null,
	env.DOCS_DIR || import.meta.env.DEV ? join(process.cwd(), '.svelte-kit', 'docs') : process.cwd()
);
