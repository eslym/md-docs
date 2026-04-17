// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			details?: string;
		}
		// interface Locals {}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type MaybePromise<T> = T | Promise<T>;

	type Prettify<T> = {
		[K in keyof T]: T[K];
	} & {};
}

export {};
