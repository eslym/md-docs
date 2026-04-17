<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['tbody'];
	} = $props();
</script>

<tbody>
	{#each node.children as child}<Node node={child} />{/each}
</tbody>
