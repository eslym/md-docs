<script lang="ts" module>
	const supported_formats = new Set(['avif', 'webp', 'jpeg', 'png']);

	function optimization_widths(src: string): number[] {
		const widths = new Set<number>();
		const specs = src.split(',').map((s) => s.trim());
		for (const spec of specs) {
			let match = /^(\d+)w$/.exec(spec);
			if (match) {
				widths.add(parseInt(match[1], 10));
				continue;
			}
			match = /^(\d+)\.\.(\d+);(\d+)$/.exec(spec);
			if (match) {
				const a = parseInt(match[1], 10);
				const b = parseInt(match[2], 10);
				const step = parseInt(match[3], 10);
				const start = Math.min(a, b);
				const end = Math.max(a, b);
				for (let w = start; w <= end; w += step) {
					widths.add(w);
				}
			}
		}
		return [...widths].sort((a, b) => a - b);
	}
</script>

<script lang="ts">
	import type { Mermaid } from '$lib/mermaid';
	import type { HighlighterCore } from 'shiki/core';
	import AppMain from './app-main.svelte';
	import AppHeader from './app-header.svelte';
	import { ShikiContext } from '$lib/components/app/markdown/features/shiki.svelte';
	import { MermaidContext } from '$lib/components/app/markdown/features/mermaid.svelte';
	import { page } from '$app/state';
	import { MarkdownRenderer } from '$lib/components/app/markdown';

	let { data } = $props();

	let history = $state({
		mermaid: new Map<string, string>()
	});

	let mermaid_instance: Mermaid | undefined = $state(undefined);
	let shiki_instance: HighlighterCore | undefined = $state(undefined);

	let base = $derived(new URL(data.loc, page.url.origin));

	MermaidContext.set({
		get cache() {
			return history.mermaid;
		},
		get mermaid() {
			return mermaid_instance ?? data.tools.mermaid;
		},
		set mermaid(value) {
			mermaid_instance = value;
		}
	});

	ShikiContext.set({
		get highlighter() {
			return shiki_instance ?? data.tools.shiki;
		},
		set highlighter(value) {
			shiki_instance = value;
		}
	});

	export const snapshot = {
		capture: () => $state.snapshot(history),
		restore: (snapshot: any) => {
			history = snapshot;
		}
	};
</script>

<svelte:head>
	<title>{data.doc.meta.title ?? 'Untitled Document'}</title>
	{#if data.doc.meta.description}
		<meta name="description" content={data.doc.meta.description} />
		<meta property="og:description" content={data.doc.meta.description} />
	{/if}
	<link rel="alternate" type="text/markdown" href={data.loc} />
</svelte:head>

<AppHeader title={data.doc.meta.title ?? 'Untitled Document'} />

<AppMain>
	<section class="mx-auto my-16 prose px-4 md:prose-lg md:px-6 print:max-w-full">
		<MarkdownRenderer
			root={data.doc}
			resolveLink={(href) => {
				if (!URL.canParse(href, base)) return undefined;
				const url = new URL(href, base);
				if (url.origin !== page.url.origin) {
					return {
						href: url.href,
						target: '_blank'
					};
				}
				if (url.pathname === base.pathname) {
					// the resolved URL might not same as page URL but it is within the same page.
					return {
						href: `${url.search}${url.hash}`,
						target: '_self'
					};
				}
				let pathname = decodeURIComponent(url.pathname);
				if (pathname.startsWith('/docs/')) {
					url.pathname = pathname.slice('/docs/'.length - 1);
				}
				return {
					href: url.href,
					target: '_self'
				};
			}}
			resolveImage={(src) => {
				if (!URL.canParse(src, base)) return;
				const url = new URL(src, base);
				const pathname = decodeURIComponent(url.pathname);
				if (
					url.origin !== page.url.origin ||
					!pathname.startsWith('/docs/') ||
					!url.searchParams.has('auto-srcset')
				) {
					return {
						src: url.href
					};
				}
				const formats = (url.searchParams.get('format') || '')
					.split(',')
					.map((s) => s.trim().toLowerCase())
					.filter((s) => supported_formats.has(s));
				const widths = optimization_widths(url.searchParams.get('width') || '');
				if (formats.length === 0 && widths.length === 0) {
					return {
						src: url.href
					};
				}
				if (formats.length === 0) {
					return {
						sources: [
							{
								srcset: widths.map((w) => `${url.pathname}?w=${w} ${w}w`).join(', ')
							}
						],
						src: url.pathname
					};
				}
				if (widths.length === 0) {
					return {
						sources: formats.map((format) => ({
							type: `image/${format}`,
							srcset: `${url.pathname}?f=${format} 1x`
						})),
						src: url.pathname
					};
				}
				return {
					sources: formats.map((format) => ({
						type: `image/${format}`,
						srcset: widths.map((w) => `${url.pathname}?f=${format}&w=${w} ${w}w`).join(', ')
					})),
					src: url.pathname
				};
			}}
		/>
	</section>
</AppMain>
