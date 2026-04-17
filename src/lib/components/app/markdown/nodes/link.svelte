<script lang="ts">
	import { MarkdownRenderContext } from '$lib/components/app/markdown/context';
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['link'];
	} = $props();

	const ctx = MarkdownRenderContext.get();

	let attrs = $derived(ctx.resolveLink(node.href) ?? { href: node.href });
</script>

<a {...attrs} title={node.title}
	>{#each node.children as child}<Node node={child} />{/each}</a
>
