<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['strikethrough'];
	} = $props();
</script>

<del
	>{#each node.children as child}<Node node={child} />{/each}</del
>
