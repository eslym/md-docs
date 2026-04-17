<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['th'];
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

<th class={cn}
	>{#each node.children as child}<Node node={child} />{/each}</th
>
