import * as z from '$lib/zod';

const object_error = z.object({
	message: z.string(),
	details: z.optional(z.string())
});

export function handleError({ error }) {
	console.error(error);
	if (Error.isError(error)) {
		return {
			message: error.message,
			details: error.stack
		};
	}
	const res = object_error.safeParse(error);
	if (res.success) {
		return res.data;
	}
	return {
		message: 'An unknown error occurred'
	};
}
