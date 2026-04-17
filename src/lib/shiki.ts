import { createHighlighterCore, type HighlighterCore, type ShikiTransformer } from 'shiki/core';
import { createOnigurumaEngine } from 'shiki/engine/oniguruma';
import { bundledLanguages } from 'shiki/bundle/full';
import {
	transformerNotationDiff,
	transformerNotationHighlight,
	transformerNotationErrorLevel,
	transformerRemoveNotationEscape
} from '@shikijs/transformers';
import type { Element, Root } from 'hast';
import parse_style from 'inline-style-parser';

let instance: Promise<HighlighterCore> | null = null;

function travel_element(el: any, fn: (el: Element) => void) {
	if (!el || typeof el !== 'object') return;
	if (el.type === 'element') {
		fn(el as Element);
	}
	for (const val of Object.values(el)) {
		travel_element(val, fn);
	}
}

const map = {
	'--shiki-dark': 'color',
	'--shiki-dark-bg': 'background-color'
} as Record<string, string>;

const transformerColorLightDark = {
	root(el) {
		travel_element(el, (el) => {
			if (typeof el.properties.style !== 'string') return;
			const styles = Object.fromEntries(
				parse_style(el.properties.style)
					.map((n) => (n.type === 'declaration' ? [n.property, n.value] : null))
					.filter((n): n is [string, string] => n !== null)
			);
			if (styles['--shiki-dark']) {
				const dark = styles['--shiki-dark'];
				delete styles['--shiki-dark'];
				styles.color = `light-dark(${styles.color}, ${dark})`;
			}
			if (styles['--shiki-dark-bg']) {
				const dark = styles['--shiki-dark-bg'];
				delete styles['--shiki-dark-bg'];
				styles['background-color'] = `light-dark(${styles['background-color']}, ${dark})`;
			}
			if (el.tagName === 'pre') {
				delete styles['background-color'];
			}
			el.properties.style = Object.entries(styles)
				.map(([k, v]) => `${k}: ${v};`)
				.join(' ');
		});
	}
} satisfies ShikiTransformer;

export const supported_languages = new Set([...Object.keys(bundledLanguages), 'text', 'ansi']);

export const shiki_options = {
	themes: {
		light: 'github-light-default',
		dark: 'github-dark-default'
	},
	transformers: [
		transformerNotationDiff(),
		transformerNotationHighlight(),
		transformerNotationErrorLevel(),
		transformerRemoveNotationEscape(),
		transformerColorLightDark
	]
};

function inst() {
	return (instance ??= createHighlighterCore({
		themes: [
			import('@shikijs/themes/github-dark-default'),
			import('@shikijs/themes/github-light-default')
		],
		langs: [],
		engine: createOnigurumaEngine(import('shiki/wasm'))
	}));
}

export function shiki(...langs: string[]) {
	langs = langs.filter(Boolean);
	return langs.length
		? inst().then((instance) => Promise.all(langs.map(load_language)).then(() => instance))
		: inst();
}

export async function load_language(lang: string): Promise<boolean> {
	if (!instance) {
		throw new Error('Highlighter is not ready');
	}
	if (lang === 'text' || lang === 'ansi') {
		return false;
	}
	const inst = await shiki();
	if (lang_loaded(lang, inst)) {
		return false;
	}
	if (supported_languages.has(lang)) {
		await inst.loadLanguage(bundledLanguages[lang as keyof typeof bundledLanguages]);
		return true;
	}
	console.warn(`[shiki] Language ${lang} is not supported`);
	return false;
}

export function code_to_hast(code: string, lang: string): Promise<Root>;
export function code_to_hast(code: string, lang: string, instance: HighlighterCore): Root;
export function code_to_hast(
	code: string,
	lang: string = 'text',
	instance: HighlighterCore | null = null
) {
	if (!instance) {
		return shiki().then((instance) => code_to_hast(code, lang, instance));
	}
	if (!instance) {
		throw new Error('Highlighter is not ready');
	} else if (!lang_loaded(lang, instance)) {
		console.warn(`Language ${lang} is not loaded, falling back to plain text`);
		lang = 'text';
	}
	return instance.codeToHast(code, {
		lang: supported_languages.has(lang) ? lang : 'text',
		...shiki_options
	});
}

export function lang_loaded(lang: string): Promise<boolean>;
export function lang_loaded(lang: string, instance: HighlighterCore): boolean;
export function lang_loaded(lang: string, instance?: HighlighterCore) {
	if (!instance) {
		return shiki().then((instance) => lang_loaded(lang, instance));
	}
	try {
		return Boolean(lang === 'text' || lang === 'ansi' || instance.getLanguage(lang));
	} catch {
		return false;
	}
}
