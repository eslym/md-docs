import * as z from '$lib/zod';

const schema = z.looseObject({
	title: z.loose(z.string()),
	description: z.loose(z.string()),
	author: z.loose(
		z.union([
			z.string(),
			z.looseObject({
				name: z.string(),
				image: z.optional(z.loose(z.string())),
				url: z.optional(z.loose(z.string()))
			})
		])
	),
	cacheControl: z.loose(
		z.union([
			z.string(),
			z.looseObject({
				maxAge: z.coerce.number()
			})
		])
	),
	markdown: z.loose(
		z.looseObject({
			parse: z.loose(
				z.intersection(
					z.record(z.string(), z.optional(z.coerce.boolean())),
					z.object({
						autolinks: z.optional(
							z.union([z.coerce.boolean(), z.record(z.string(), z.optional(z.coerce.boolean()))])
						),
						headings: z.optional(
							z.union([z.coerce.boolean(), z.record(z.string(), z.optional(z.coerce.boolean()))])
						)
					})
				)
			),
			render: z.loose(z.record(z.string(), z.optional(z.coerce.boolean())))
		})
	),
	substitute: z.loose(z.coerce.boolean()),
	vars: z.loose(z.record(z.string(), z.any()))
});

export const meta_schema = z.loose(schema, {} as MarkdownMeta);

export type MarkdownMeta = z.infer<typeof schema>;
