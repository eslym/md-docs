<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['table'];
	} = $props();
</script>

<div class="w-full overflow-x-auto">
	<table>
		{#each node.children as child}<Node node={child} />{/each}
	</table>
</div>
