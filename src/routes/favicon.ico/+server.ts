import { resolve_source } from './sources';
import faviconSvg from '$lib/assets/favicon.svg';
import { atomic_cache } from '$lib/server/cache';
import { icon_sizes } from './sizes';
import { build_ico } from './ico';
import { env } from '$env/dynamic/public';

const favicon = env.PUBLIC_APP_FAVICON || faviconSvg;

export async function GET({ url }) {
	const source = resolve_source(favicon, url.origin);
	const { mtime, maxSize } = await source.meta();
	const file = await atomic_cache(
		`favicon:${favicon}`,
		async () => {
			const sizes = icon_sizes.filter((size) => size <= maxSize);
			const entries = await Promise.all(
				sizes.map(async (size) => [size, await source.resize(size)] as const)
			);
			return build_ico(entries);
		},
		mtime
	);
	return new Response(file, {
		headers: {
			'Content-Type': 'image/x-icon',
			'Last-Modified': new Date(mtime).toUTCString()
		}
	});
}
