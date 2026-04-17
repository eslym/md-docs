<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import type { MarkdownNodeMap } from '$lib/server/markdown';
	import Node from '../node.svelte';

	let {
		node
	}: {
		node: MarkdownNodeMap['listItem'];
	} = $props();
</script>

<li>
	{#if typeof node.checked === 'boolean'}
		<Checkbox checked={node.checked} readonly class="inline-block" />
	{/if}
	{#each node.children as child}<Node node={child} />{/each}
</li>
