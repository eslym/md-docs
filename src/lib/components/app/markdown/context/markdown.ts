import type { MD } from '@eslym/markdown';
import { Context } from 'runed';
import type { HTMLAnchorAttributes, HTMLAttributes, HTMLSourceAttributes } from 'svelte/elements';

export const MarkdownRenderContext = new Context<{
	readonly options: Record<string, boolean | undefined>;
	readonly resolveLink: (href: string) =>
		| {
				href: string;
				target?: HTMLAnchorAttributes['target'];
		  }
		| undefined;
	readonly resolveImage: (src: string) =>
		| {
				src: string;
				sources?: Omit<HTMLSourceAttributes, keyof HTMLAttributes<any>>[];
		  }
		| undefined;
	readonly findDefinition: (id: string) => MD.Definition | undefined;
	readonly findFootnote: (id: string) => MD.FootnoteDefinition | undefined;
}>('markdown render context');
