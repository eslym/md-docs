<script lang="ts" module>
	import type { MarkdownNode } from '$lib/server/markdown';
	import type { Component } from 'svelte';

	const renderers: Record<
		`./nodes/${MarkdownNode['type']}.svelte`,
		Component<{
			node: MarkdownNode;
		}>
	> = import.meta.glob('./nodes/*.svelte', { eager: true, import: 'default' });
</script>

<script lang="ts">
	let {
		node
	}: {
		node: MarkdownNode;
	} = $props();

	let Render = $derived(
		renderers[`./nodes/${node.type}.svelte`] ?? renderers['./nodes/comment.svelte']
	);
</script>

{#key Render}<Render {node} />{/key}
