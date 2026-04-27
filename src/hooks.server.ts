import Handlebars, { type HelperOptions } from 'handlebars';
import * as z from '$lib/zod';
import { env } from '$env/dynamic/private';
import { clear_cache } from '$lib/server/cache';
import { docs_path } from '$lib/server/dir';
import faviconSvg from '$lib/assets/favicon.svg';
import themeCss from '$lib/assets/theme.css?url';

const keep_cache = z.loose(z.coerce.boolean(), false).parse(env.KEEP_CACHE);

async function find_setup(): Promise<((url: URL) => MaybePromise<any>) | undefined> {
	let resolved_path: string;
	try {
		resolved_path = Bun.resolveSync(docs_path('.setup'), process.cwd());
	} catch {
		return undefined;
	}
	const mod = await import(resolved_path);
	if (typeof mod.default === 'function') {
		return mod.default;
	}
	if (typeof mod.setup === 'function') {
		return mod.setup;
	}
	return undefined;
}

const default_locals: App.Locals = {
	app: {
		name: 'md-docs',
		favicon: faviconSvg,
		themeCss
	}
};

const locals_schema = z.loose(
	z.looseObject({
		app: z.loose(
			z.object({
				name: z.loose(z.string(), default_locals.app.name),
				subtitle: z.optional(z.string()),
				favicon: z.loose(z.string(), default_locals.app.favicon),
				themeCss: z.loose(z.string(), default_locals.app.themeCss)
			}),
			default_locals.app
		)
	}),
	default_locals
);

const resolved_locals = new WeakMap<any, App.Locals>();

function wrap_setup(
	setup: ((url: URL) => MaybePromise<any>) | undefined
): (url: URL) => MaybePromise<App.Locals> {
	if (!setup) return () => default_locals;
	return async (url: URL) => {
		const result = await setup(url);
		if (typeof result !== 'object' || result === null) {
			return default_locals;
		}
		if (resolved_locals.has(result)) {
			return resolved_locals.get(result)!;
		}
		const locals = locals_schema.parse(result);
		resolved_locals.set(result, locals);
		return locals;
	};
}

let load_locals: (url: URL) => MaybePromise<App.Locals> = null!;

export async function init() {
	if (!keep_cache) {
		await clear_cache();
	}
	Handlebars.registerHelper('stringify', (value) => {
		return JSON.stringify(value).replace('<', '\\u003c');
	});
	Handlebars.registerHelper('partialString', (value) => {
		return JSON.stringify(`${value}`).slice(1, -1).replace('<', '\\u003c');
	});
	Handlebars.registerHelper('asbool', (...args) => {
		args.pop() as HelperOptions;
		if (args.length > 1 && typeof args[1] !== 'boolean') {
			return new Handlebars.SafeString('[[Second argument of asbool helper must be a boolean]]');
		}
		const value = args[0];
		const fallback = args[1];
		return z.loose(z.coerce.boolean(), fallback).parse(value);
	});
	Handlebars.registerHelper('iif', (...args) => {
		args.pop() as HelperOptions;
		if (args.length < 2) {
			return new Handlebars.SafeString('[[iif helper requires at least 2 arguments]]');
		}
		return args[0] ? args[1] : args[2];
	});
	Handlebars.registerHelper('coalesce', (...args) => {
		args.pop() as HelperOptions;
		return args.find((arg) => arg !== null && arg !== undefined && arg !== '') ?? null;
	});
	load_locals = wrap_setup(await find_setup());
}

const keep_headers = new Set<string>(['content-type', 'content-location']);

export async function handle({ event, resolve }) {
	event.locals = await load_locals(event.url);
	return resolve(event, {
		filterSerializedResponseHeaders(name) {
			return keep_headers.has(name.toLowerCase());
		}
	});
}

const object_error = z.object({
	message: z.string(),
	details: z.optional(z.string())
});

export function handleError({ error }) {
	console.error(error);
	if (Error.isError(error)) {
		return {
			message: error.message,
			details: Bun.inspect(error, { colors: true })
		};
	}
	const res = object_error.safeParse(error);
	if (res.success) {
		return res.data;
	}
	return {
		message: 'An unknown error occurred',
		details: Bun.inspect(error, { colors: true })
	};
}
