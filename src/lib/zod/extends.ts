import { type ZodMiniType, type infer as Infer, transform, z } from 'zod/mini';

function resolve_fallback(fallback: any) {
	return structuredClone(typeof fallback === 'function' ? fallback() : fallback);
}

export function loose<Schema extends ZodMiniType>(
	schema: Schema
): ZodMiniType<Infer<Schema> | undefined>;
export function loose<Schema extends ZodMiniType, Fallback>(
	schema: Schema,
	fallback: Fallback
): ZodMiniType<Infer<Schema> | (Fallback extends (...args: any[]) => infer R ? R : Fallback)>;
export function loose(schema: ZodMiniType, fallback: any = undefined): ZodMiniType {
	return z
		.optional(
			transform((val) => {
				const result = schema.safeParse(val);
				return result.success ? result.data : resolve_fallback(fallback);
			})
		)
		.check(z.overwrite((val) => (val === undefined ? resolve_fallback(fallback) : val)));
}
