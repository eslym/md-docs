<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['td'];
	} = $props();

	let cn = $derived.by(() => {
		switch (node.align) {
			case 'center':
				return 'text-center';
			case 'right':
				return 'text-right';
			default:
				return 'text-left';
		}
	});
</script>

<td class={cn}
	>{#each node.children as child}<Node node={child} />{/each}</td
>
