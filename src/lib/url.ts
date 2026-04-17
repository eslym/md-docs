export function resolve_url(
	url: string,
	base: string | URL | undefined = undefined,
	strict = false
): string {
	if (!URL.canParse(url, base)) {
		if (strict) {
			throw new TypeError(`Invalid URL: ${url}`);
		}
		return url;
	}
	return new URL(url, base).href;
}

export function optimizable(url: URL, base: URL): boolean {
	const pathname = decodeURIComponent(url.pathname);
	if (url.origin !== base.origin || !pathname.startsWith('/docs/')) return false;
	if (url.searchParams.has('width') || url.searchParams.has('format')) return false;
	if (url.searchParams.has('skip-optimize')) return false;
	if (/\.svg$/i.test(pathname)) return false;
	return true;
}
