<script lang="ts">
	import { env } from '$env/dynamic/public';
	import { MermaidContext } from '$lib/components/app/markdown/features/mermaid.svelte';
	import type { Mermaid } from '$lib/mermaid';
	import { page } from '$app/state';
	import { optimizable, resolve_url } from '$lib/url';
	import type { HighlighterCore } from 'shiki/core';
	import { ShikiContext } from '$lib/components/app/markdown/features/shiki.svelte';
	import { MarkdownRenderer } from '$lib/components/app/markdown';
	import { gen_widths } from '$lib/width';
	import AppMain from './app-main.svelte';
	import AppHeader from './app-header.svelte';

	let { data } = $props();

	let history = $state({
		mermaid: new Map<string, string>()
	});

	let mermaid_instance: Mermaid | undefined = $state(undefined);
	let shiki_instance: HighlighterCore | undefined = $state(undefined);

	let title = $derived.by(() => {
		if (data.meta.title) {
			return data.meta.title;
		}
		if (data.doc.toc[0]?.text) {
			return data.doc.toc[0].text;
		}
		return 'Untitled Document';
	});

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
	<title>{title}{env.PUBLIC_APP_TITLE_SUFFIX ?? ''}</title>
	{#if data.meta.description}
		<meta name="description" content={data.meta.description} />
		<meta property="og:description" content={data.meta.description} />
	{/if}
	{#if data.meta.author}
		{#if typeof data.meta.author === 'string'}
			<meta name="author" content={data.meta.author} />
		{:else}
			<meta name="author" content={data.meta.author.name} />
			{#if data.meta.author.url}
				<link rel="author" href={resolve_url(data.meta.author.url, page.url)} />
			{/if}
		{/if}
	{/if}
	<link rel="alternate" type="text/markdown" href={data.loc} />
</svelte:head>

<AppHeader {title} />

<AppMain>
	<section class="mx-auto my-16 prose px-4 md:prose-lg md:px-6">
		<MarkdownRenderer
			root={data.doc.root}
			options={data.meta.markdown?.render ?? {}}
			resolveLink={(href) => {
				if (!URL.canParse(href, base)) return undefined;
				const url = new URL(href, base);
				if (url.origin !== page.url.origin) {
					return {
						href: url.href,
						target: '_blank'
					};
				}
				let pathname = decodeURIComponent(url.pathname);
				if (pathname.startsWith('/docs/')) {
					pathname = pathname.slice('/docs/'.length - 1);
				}
				return {
					href: url.href,
					target: '_self'
				};
			}}
			resolveImage={(src) => {
				if (!URL.canParse(src, base)) return;
				const url = new URL(src, base);
				if (!optimizable(url, base)) {
					return { src: url.href };
				}
				const pathname = decodeURIComponent(url.pathname);
				const dim = data.images.get(pathname);
				if (!dim) return { src: url.href };
				const widths = gen_widths(dim.width);
				return {
					src: url.href,
					sources: ['avif', 'webp', 'png'].map((format) => {
						const srcset = widths
							.map((width) => {
								const u = new URL(pathname, base.origin);
								u.searchParams.set('f', format);
								u.searchParams.set('w', width.toString());
								return `${u.href} ${width}w`;
							})
							.join(', ');
						return {
							type: `image/${format}`,
							srcset
						};
					})
				};
			}}
		/>
	</section>
</AppMain>
