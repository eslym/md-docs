<script lang="ts">
	import { MarkdownRenderContext } from '../context/markdown';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Image } = $props();

	const ctx = MarkdownRenderContext.get();
	let resolved_image = $derived(ctx.resolveImage(node.url));
</script>

{#if resolved_image}
	{#if resolved_image.sources?.length}
		<picture>
			{#each resolved_image.sources as source, i (i)}
				<source {...source} />
			{/each}
			<img src={resolved_image.src} alt={node.alt ?? ''} title={node.title ?? undefined} />
		</picture>
	{:else}
		<img src={resolved_image.src} alt={node.alt ?? ''} title={node.title ?? undefined} />
	{/if}
{:else}
	<img src={node.url} alt={node.alt ?? ''} title={node.title ?? undefined} />
{/if}
