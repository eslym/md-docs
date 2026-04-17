<script lang="ts" module>
	function safe_props(attrs: [string, string][]) {
		return Object.fromEntries(attrs.filter(([key]) => !key.startsWith('on')));
	}
</script>

<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['html'];
	} = $props();
</script>

<svelte:element this={node.tag} {...safe_props(node.attrs)}
	>{#each node.children as child}<Node node={child} />{/each}</svelte:element
>
