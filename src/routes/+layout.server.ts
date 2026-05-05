import faviconSvg from '$lib/assets/favicon.svg';
import { menu_groups } from '$lib/menu';
import { docs_path } from '$lib/server/dir';

const menu_lookup = new Bun.Glob('.menu.{json,yml,yaml}');

let resolved_menu:
	| {
			path: string;
			mtime: number;
			menu: App.MenuGroup[] | App.MenuGroup;
	  }
	| undefined = undefined;

export async function load({ locals, url }) {
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
	let menu: App.MenuGroup | App.MenuGroup[] | undefined = undefined;
	for await (const path of menu_lookup.scan({ absolute: true, dot: true, cwd: docs_path() })) {
		const file = Bun.file(path);
		if (resolved_menu && resolved_menu.path === path && resolved_menu.mtime === file.lastModified) {
			menu = resolved_menu.menu;
		} else if (file.type.startsWith('application/json')) {
			const content = await file.json();
			menu = menu_groups.parse(content);
		} else {
			const content = await file.text();
			const yaml = Bun.YAML.parse(content);
			menu = menu_groups.parse(yaml);
		}
		resolved_menu = {
			path,
			mtime: file.lastModified,
			menu
		};
		break;
	}
	return {
		locals: {
			...locals,
			app: {
				...app,
				favicon: resolved_favicon
			}
		},
		menu
	};
}
