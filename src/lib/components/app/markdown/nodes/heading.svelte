<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['heading'];
	} = $props();

	let tag = $derived(`h${node.level}`);
</script>

<svelte:element this={tag} id={node.id}
	>{#each node.children as child}<Node node={child} />{/each}</svelte:element
>
