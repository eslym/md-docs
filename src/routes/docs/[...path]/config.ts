import { env as private_env } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import * as z from '$lib/zod';

export { env };

export const meta_in_md = /^\-{3,}\n([\s\S]+?)\n-{3,}\n/;

export const cache_control =
	private_env.CACHE_CONTROL || `public, max-age=${private_env.CACHE_CONTROL_MAXAGE || 0}`;

const disable_substitution = z.loose(z.coerce.boolean(), false).parse(private_env.NO_SUBSTITUTE);

export const should_substitute_markdown =
	!disable_substitution && z.loose(z.coerce.boolean(), true).parse(private_env.SUBSTITUTE_MARKDOWN);

export const should_substitute_yaml =
	!disable_substitution && z.loose(z.coerce.boolean(), true).parse(private_env.SUBSTITUTE_YAML);

export const should_substitute_json =
	!disable_substitution && z.loose(z.coerce.boolean(), true).parse(private_env.SUBSTITUTE_JSON);

export const should_substitute_html =
	!disable_substitution && z.loose(z.coerce.boolean(), true).parse(private_env.SUBSTITUTE_HTML);

export const format_arr = ['avif', 'jpeg', 'png', 'webp', 'auto'] as const;
export type Format = (typeof format_arr)[number];

const formats = new Set<string>(format_arr);

export function is_format(format: string | null): format is Format {
	return format !== null && formats.has(format);
}
