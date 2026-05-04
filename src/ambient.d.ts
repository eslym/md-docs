declare module '*?xxhash64' {
	const hash: bigint;
	export default hash;
}

declare module '*.hbs' {
	import type { TemplateDelegate } from 'handlebars';
	const template: TemplateDelegate;
	export default template;
}
