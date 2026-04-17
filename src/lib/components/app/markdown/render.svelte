<script lang="ts">
	import { MarkdownRenderContext } from '$lib/components/app/markdown/context';
	import Node from './node.svelte';
	import type { MarkdownNode } from '$lib/server/markdown';

	let {
		root,
		options = {},
		resolveLink = () => undefined,
		resolveImage = () => undefined
	}: {
		root: MarkdownNode[];
	} & Partial<ReturnType<typeof MarkdownRenderContext.get>> = $props();

	MarkdownRenderContext.set({
		get options() {
			return options;
		},
		get resolveLink() {
			return resolveLink;
		},
		get resolveImage() {
			return resolveImage;
		}
	});
</script>

{#each root as node}<Node {node} />{/each}
