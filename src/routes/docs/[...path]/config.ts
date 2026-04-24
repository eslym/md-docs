import { env as private_env } from '$env/dynamic/private';
import { env } from '$env/dynamic/public';
import * as z from '$lib/zod';

export { env };

export const meta_in_md = /^\-{3,}\n([\s\S]+?)\n-{3,}\n/;

const cache_control_maxage = z
	.loose(z.coerce.integer().check(z.minimum(0)), 0)
	.parse(private_env.CACHE_CONTROL_MAXAGE);

export const cache_control =
	private_env.CACHE_CONTROL || `public, max-age=${cache_control_maxage || 0}`;

const disable_hbs = z.loose(z.coerce.boolean(), false).parse(private_env.NO_HBS);

export const format_arr = ['avif', 'jpeg', 'png', 'webp', 'auto'] as const;
export type Format = (typeof format_arr)[number];

const formats = new Set<string>(format_arr) as any as {
	has(value: string): value is Format;
};
