<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Heading } = $props();

	let tag_name = $derived(`h${Math.max(1, Math.min(6, node.depth))}`);
</script>

<svelte:element this={tag_name} id={node.id}
	>{@render render_children(node.children)}</svelte:element
>
