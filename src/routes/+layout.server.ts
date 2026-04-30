import faviconSvg from '$lib/assets/favicon.svg';

export function load({ locals, url }) {
	const { favicon, ...app } = locals.app;
	let resolved_favicon: string = faviconSvg;
	if (favicon.startsWith('data:')) {
		resolved_favicon = favicon;
	} else if (URL.canParse(favicon, url.origin)) {
		const favicon_url = new URL(favicon, url.origin);
		const pathname = decodeURIComponent(favicon_url.pathname);
		if (favicon_url.origin === url.origin && pathname.startsWith('/docs/')) {
			resolved_favicon = favicon_url.pathname + favicon_url.search;
		} else if (favicon_url.protocol === 'file:') {
			resolved_favicon = '/favicon.png?size=32';
		} else {
			resolved_favicon = favicon;
		}
	}
	return {
		locals: {
			...locals,
			app: {
				...app,
				favicon: resolved_favicon
			}
		}
	};
}
