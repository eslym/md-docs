<script lang="ts" module>
	const types = ['1', 'a', 'A', 'i', 'I'] as const;
</script>

<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['list'];
	} = $props();

	let tag: 'ul' | 'ol' = $derived(node.ordered ? 'ol' : 'ul');
</script>

<svelte:element this={tag} start={node.start} type={node.ordered ? types[node.depth] : undefined}>
	{#each node.children as child}<Node node={child} />{/each}
</svelte:element>
