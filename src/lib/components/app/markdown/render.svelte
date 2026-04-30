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
		root: Pick<MD.Document, 'children' | 'definitions' | 'footnotes'>;
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

{#if root.footnotes && Object.values(root.footnotes).length > 0}
	<hr />
	<ol class="grid gap-x-4 gap-y-2 text-[0.75em] md:grid-cols-2">
		{#each Object.values(root.footnotes) as footnote}
			<Node node={footnote} />
		{/each}
	</ol>
{/if}
