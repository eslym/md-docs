export async function flatten_child_promise<T extends Record<string, any>>(
	object: T
): Promise<{
	[K in keyof T]: Awaited<T[K]>;
}> {
	const entries = await Promise.all(
		Object.entries(object).map(([key, value_1]) =>
			Promise.resolve(value_1).then((resolved) => [key, resolved] as const)
		)
	);
	return Object.fromEntries(entries) as any;
}
