import * as z from 'zod/mini';

const booleans = new Set<any>([true, false, 0, 1, 0n, 1n, '0', '1', 'true', 'false']);
const truely = new Set<any>([true, 1, 1n, '1', 'true']);

export function boolean(message?: string): z.ZodMiniType<boolean> {
	return z.transform((input, ctx) => {
		const normalized = typeof input === 'string' ? input.toLowerCase() : input;
		if (typeof input === 'boolean') return input;
		if (booleans.has(normalized)) return truely.has(normalized);
		ctx.issues.push({
			input,
			code: 'invalid_type',
			expected: 'boolean-like',
			received: input === null ? 'null' : typeof input,
			message
		});
		return z.NEVER;
	});
}

export function number(message?: string): z.ZodMiniType<number> {
	return z.transform((input, ctx) => {
		if (typeof input === 'number') return input;
		if (typeof input === 'bigint') return Number(input);
		if (typeof input === 'string' && input.trim() !== '') {
			const parsed = Number(input);
			if (!isNaN(parsed)) return parsed;
		}
		ctx.issues.push({
			input,
			code: 'invalid_type',
			expected: 'number-like',
			received: input === null ? 'null' : typeof input,
			message
		});
		return z.NEVER;
	});
}

export function integer(message?: string): z.ZodMiniType<number> {
	return z.transform((input, ctx) => {
		if (typeof input === 'number' && Number.isInteger(input)) return input;
		if (typeof input === 'bigint') {
			const num = Number(input);
			if (Number.isSafeInteger(num)) return num;
		}
		if (typeof input === 'string' && input.trim() !== '') {
			const parsed = Number(input);
			if (!isNaN(parsed) && Number.isInteger(parsed)) return parsed;
		}
		ctx.issues.push({
			input,
			code: 'invalid_type',
			expected: 'integer-like',
			received: input === null ? 'null' : typeof input,
			message
		});
		return z.NEVER;
	});
}
