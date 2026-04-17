<script lang="ts">
	import { MarkdownRenderContext } from '$lib/components/app/markdown/context';
	import type { MarkdownNodeMap } from '$lib/server/markdown';

	let {
		node
	}: {
		node: MarkdownNodeMap['image'];
	} = $props();

	const ctx = MarkdownRenderContext.get();

	let config = $derived(ctx.resolveImage(node.src) ?? node.src);
</script>

{#if typeof config === 'string'}
	<img src={config} alt={node.alt} title={node.title} />
{:else if config.sources}
	<picture>
		{#each config.sources as source}
			<source {...source} />
		{/each}
		<img src={config.src} alt={node.alt} title={node.title} />
	</picture>
{:else}
	<img src={config.src} alt={node.alt} title={node.title} />
{/if}
