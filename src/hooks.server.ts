import Handlebars, { type HelperOptions } from 'handlebars';
import * as z from '$lib/zod';
import { env } from '$env/dynamic/private';
import { clear_cache } from '$lib/server/cache';

const keep_cache = z.loose(z.coerce.boolean(), false).parse(env.KEEP_CACHE);

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
