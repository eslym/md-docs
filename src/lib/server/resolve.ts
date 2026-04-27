import { docs_path } from '$lib/server/dir';
import * as fs from 'node:fs/promises';

const text_types = new Set([
	'application/json',
	'application/javascript',
	'application/xml',
	'image/svg+xml'
]);

function is_text(type: string) {
	return type.startsWith('text/') || text_types.has(type.split(';')[0].trim());
}

function* resolve_paths(path: string, extname: string, index: boolean, hbs: boolean) {
	const ext_is_text = is_text(Bun.file('index' + extname).type);
	if (path.endsWith('/') && index) {
		yield path + 'index' + extname;
		if (hbs && ext_is_text) yield path + 'index' + extname + '.hbs';
	} else {
		yield path;
		if (hbs && is_text(Bun.file(path).type)) yield path + '.hbs';
		if (extname) {
			yield path + extname;
			if (hbs && ext_is_text) yield path + extname + '.hbs';
		}
		if (index) {
			yield path + '/index' + extname;
			if (hbs && ext_is_text) yield path + '/index' + extname + '.hbs';
		}
	}
}

export async function resolve(
	path: string,
	{
		extname = '.md',
		index = true,
		hbs = true
	}: {
		extname?: string;
		index?: boolean;
		hbs?: boolean;
	} = {}
): Promise<[found: boolean, path: string, absolute: string]> {
	if (!path.startsWith('/')) path = '/' + path;
	for (const resolved_path of resolve_paths(path, extname, index, hbs)) {
		const absolute = docs_path(resolved_path);
		const stat = await fs.stat(absolute).catch(() => null);
		if (stat?.isFile()) {
			return [true, resolved_path.replace(/\.hbs$/i, ''), absolute];
		}
	}
	return [false, '', ''];
}
