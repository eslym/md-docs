<script lang="ts">
	import { MarkdownRenderContext } from './context';
	import Node from './node.svelte';
	import type { MD } from '@eslym/markdown';

	let {
		root,
		options = {},
		resolveLink = () => undefined,
		resolveImage = () => undefined
	}: {
		root: MD.Document;
	} & Partial<ReturnType<typeof MarkdownRenderContext.get>> = $props();

	function findDefinition(id: string) {
		return root.definitions?.[id];
	}

	function findFootnote(id: string) {
		return root.footnotes?.[id];
	}

	MarkdownRenderContext.set({
		get options() {
			return options;
		},
		get resolveLink() {
			return resolveLink;
		},
		get resolveImage() {
			return resolveImage;
		},
		get findDefinition() {
			return findDefinition;
		},
		get findFootnote() {
			return findFootnote;
		}
	});
</script>

{#each root.children as node}<Node {node} />{/each}
