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
