// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces
declare global {
	namespace App {
		interface Error {
			message: string;
			details?: string;
		}
		interface Locals {
			app: {
				name: string;
				subtitle?: string;
				favicon: string;
				themeCss: string;
			};
			[key: string]: unknown;
		}
		// interface PageData {}
		// interface PageState {}
		// interface Platform {}
	}

	type Nullable<T> = T | null | undefined;

	type MaybePromise<T> = T | Promise<T>;

	type Prettify<T> = {
		[K in keyof T]: T[K];
	} & {};
}

declare module '@eslym/markdown' {
	namespace MD {
		interface Heading {
			id?: Nullable<string>;
		}

		interface FootnoteReference {
			domId?: Nullable<string>;
			linkId?: Nullable<string>;
		}

		interface FootnoteDefinition {
			domId?: Nullable<string>;
			linkId?: Nullable<string>;
		}

		interface FootnoteBackRef extends Node {
			type: 'footnoteBackRef';
			id: string;
		}

		interface NodeMap {
			footnoteBackRef: FootnoteBackRef;
		}
	}
}

export {};
