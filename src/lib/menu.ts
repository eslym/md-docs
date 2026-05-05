import * as z from '$lib/zod';

const menu_subentry = z.object({
	title: z.string(),
	target: z.optional(z.enum(['_blank', '_self', '_parent', '_top'])),
	href: z.string()
});

const menu_entry = z.union([
	z.object({
		title: z.string(),
		target: z.optional(z.enum(['_blank', '_self', '_parent', '_top'])),
		href: z.string()
	}),
	z.object({
		title: z.string(),
		items: z.union([menu_subentry, z.array(menu_subentry)])
	})
]);

const menu_group = z.object({
	title: z.string(),
	items: z.union([menu_entry, z.array(menu_entry)])
});

export const menu_groups = z.union([menu_group, z.array(menu_group)]);
