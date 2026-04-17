<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['strong'];
	} = $props();
</script>

<strong
	>{#each node.children as child}<Node node={child} />{/each}</strong
>
