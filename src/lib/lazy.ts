export function lazy<T extends Record<string, () => any>>(
	create: T
): { [K in keyof T]: ReturnType<T[K]> } {
	const lazy = {};
	for (const key of Object.keys(create)) {
		Object.defineProperty(lazy, key, {
			get() {
				const value = create[key]();
				Object.defineProperty(lazy, key, {
					value,
					enumerable: true,
					configurable: true,
					writable: false
				});
				return value;
			},
			set(v) {
				Object.defineProperty(lazy, key, {
					value: v,
					enumerable: true,
					configurable: true,
					writable: false
				});
			},
			enumerable: true,
			configurable: true
		});
	}
	return lazy as any;
}

export function lazy_array<T extends ((index: number) => any)[]>(
	create: T
): { [K in keyof T]: ReturnType<T[K]> } {
	const lazy: any[] = new Array(create.length);
	for (let i = 0; i < create.length; i++) {
		Object.defineProperty(lazy, i, {
			get() {
				const value = create[i](i);
				Object.defineProperty(lazy, i, {
					value,
					enumerable: true,
					configurable: true,
					writable: false
				});
				return value;
			},
			set(v) {
				Object.defineProperty(lazy, i, {
					value: v,
					enumerable: true,
					configurable: true,
					writable: false
				});
			},
			enumerable: true,
			configurable: true
		});
	}
	return lazy as any;
}
