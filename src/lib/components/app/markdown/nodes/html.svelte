<script lang="ts" module>
	function transform_props(attrs: [string, string][]) {
		return Object.fromEntries(
			attrs.map(([key, val]) => {
				if (key.startsWith('on')) {
					const fn = new Function('event', val);
					return [key, (event: Event) => fn.call(event.currentTarget, event)] as const;
				}
				return [key, val] as const;
			})
		);
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

<svelte:element this={node.tag} {...transform_props(node.attrs)}
	>{#each node.children as child}<Node node={child} />{/each}</svelte:element
>
