<script lang="ts">
	import { MarkdownRenderContext } from '../context';
	import Mermaid from '$lib/components/app/markdown/features/mermaid.svelte';
	import Shiki from '$lib/components/app/markdown/features/shiki.svelte';
	import type { MarkdownNodeMap } from '$lib/server/markdown';

	let {
		node
	}: {
		node: MarkdownNodeMap['code'];
	} = $props();

	const ctx = MarkdownRenderContext.get();
</script>

{#if node.lang === 'mermaid' && ctx.options.mermaid !== false}
	<Mermaid code={node.value} />
{:else if ctx.options.highlight !== false}
	<Shiki code={node.value} lang={node.lang ?? 'text'} />
{/if}
