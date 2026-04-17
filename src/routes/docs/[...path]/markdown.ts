import Handlebars from 'handlebars';
import { atomic_cache } from '$lib/server/cache';
import { docs_path } from '$lib/server/dir';
import {
	meta_schema,
	parse_markdown,
	parser_revision,
	type MarkdownDocument,
	type MarkdownMeta
} from '$lib/server/markdown';
import { decode, encode, msgpack_response } from '$lib/msgpack';
import { cache_control, env, meta_in_md, should_substitute_markdown } from './config';
import { cache_headers } from './http';
import { compress_mdast } from '$lib/markdown';

const md_cache_key = 'md:';

export async function cached_markdown(path: string, mtime: number) {
	if (!should_substitute_markdown) {
		return Bun.file(docs_path(path));
	}

	return atomic_cache(
		md_cache_key + path,
		async () => {
			const md = await Bun.file(docs_path(path)).text();
			return substitute_markdown(md);
		},
		mtime
	);
}

function substitute_markdown(md: string): string {
	const match = md.match(meta_in_md);
	if (match) {
		const meta_string = Handlebars.compile(match[1])({ env });
		const meta = Bun.YAML.parse(meta_string);
		const parsed = meta_schema.parse(meta);
		if (parsed.substitute === false) {
			return rebuild_meta(parsed) + md.slice(match[0].length);
		}
		return (
			rebuild_meta(parsed) +
			Handlebars.compile(md.slice(match[0].length))({ env, vars: parsed.vars ?? {} })
		);
	}

	return Handlebars.compile(md)({ env, vars: {} });
}

function rebuild_meta({ substitute, vars, ...meta }: MarkdownMeta): string {
	return `---\n${Bun.YAML.stringify(meta, null, 2)}\n---\n`;
}

const ast_cache_key = 'ast:' + parser_revision.toString(16).padStart(16, '0') + ':';

async function cached_ast(path: string, mtime: number) {
	return atomic_cache(
		ast_cache_key + path,
		async () => {
			const file = await cached_markdown(path, mtime);
			const md = await file.text();
			const match = md.match(meta_in_md);
			const meta_string = match?.[1] ?? '';
			const meta = meta_schema.parse(Bun.YAML.parse(meta_string));
			const opts = {
				...meta.markdown?.parse,
				headings:
					meta.markdown?.parse?.headings === true
						? {
								ids: true
							}
						: meta.markdown?.parse?.headings === false
							? false
							: {
									ids: true,
									...meta.markdown?.parse?.headings
								}
			};
			const doc = parse_markdown(match ? md.slice(match[0].length) : md, opts);
			if (meta.markdown) {
				delete meta.markdown.parse;
			}
			return encode([parser_revision, `/docs${path}`, meta, compress_mdast(doc)]);
		},
		mtime
	);
}

export async function response_mdast(path: string, mtime: number) {
	const file = await cached_ast(path, mtime);
	const buff = await file.bytes();
	const data = decode(buff) as [rev: bigint, loc: string, meta: MarkdownMeta, doc: unknown[]];

	const cc = data[2].cacheControl
		? typeof data[2].cacheControl === 'string'
			? data[2].cacheControl
			: `public, max-age=${data[2].cacheControl.maxAge}`
		: cache_control;

	return msgpack_response(data, {
		headers: {
			...cache_headers(mtime, cc)
		}
	});
}

export async function response_markdown(path: string, mtime: number) {
	const file = await cached_markdown(path, mtime);
	const md = await file.text();
	const meta = md.match(meta_in_md)?.[1] ?? '';
	const parsed = meta_schema.parse(Bun.YAML.parse(meta));
	const cc = parsed.cacheControl
		? typeof parsed.cacheControl === 'string'
			? parsed.cacheControl
			: `public, max-age=${parsed.cacheControl.maxAge}`
		: cache_control;

	return new Response(md, {
		headers: {
			'Content-Type': 'text/markdown; charset=utf-8',
			...cache_headers(mtime, cc)
		}
	});
}
