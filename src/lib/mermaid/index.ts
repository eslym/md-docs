import { ShadcnTheme } from './shadcn';
import themeCss from './theme.css?raw';

export type Mermaid = typeof import('mermaid').default;

let instance: Promise<Mermaid> | null = null;

export function mermaid(): Promise<Mermaid> {
	if (import.meta.env.SSR) {
		return (instance ??= Promise.resolve(undefined as any));
	}
	return (instance ??= import('mermaid').then(({ default: mermaid }) => {
		const themeClass = new ShadcnTheme();
		themeClass.updateColors();
		mermaid.initialize({
			securityLevel: 'strict',
			startOnLoad: false,
			themeClass,
			themeCss
		} as any);
		return mermaid;
	}));
}
