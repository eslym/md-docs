<script lang="ts">
	import { MarkdownRenderContext } from '../context/markdown';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ImageReference } = $props();

	const ctx = MarkdownRenderContext.get();
	let def = $derived(ctx.findDefinition(node.identifier)!);
	let resolved_image = $derived(ctx.resolveImage(def.url));
</script>

{#if resolved_image}
	{#if resolved_image.sources?.length}
		<picture>
			{#each resolved_image.sources as source, i (i)}
				<source {...source} />
			{/each}
			<img src={resolved_image.src} alt={node.alt ?? ''} title={def.title ?? undefined} />
		</picture>
	{:else}
		<img src={resolved_image.src} alt={node.alt ?? ''} title={def.title ?? undefined} />
	{/if}
{:else}
	<img src={def.url} alt={node.alt ?? ''} title={def.title ?? undefined} />
{/if}
