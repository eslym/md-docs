<script lang="ts">
	import { MarkdownRenderContext } from '../context/markdown';
	import Mermaid from '../features/mermaid.svelte';
	import Shiki from '../features/shiki.svelte';
	import type { MD } from '@eslym/markdown';

	let {
		node
	}: {
		node: MD.Code;
	} = $props();

	const ctx = MarkdownRenderContext.get();
</script>

{#if node.lang === 'mermaid' && ctx.options.mermaid !== false}
	<Mermaid code={node.value} />
{:else if ctx.options.highlight !== false}
	<Shiki code={node.value} lang={node.lang ?? 'text'} />
{/if}
