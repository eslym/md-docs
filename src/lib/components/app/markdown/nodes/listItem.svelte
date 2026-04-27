<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ListItem } = $props();
</script>

<li>
	{#if typeof node.checked === 'boolean'}
		<Checkbox checked={node.checked} readonly class="inline-block" />
	{/if}
	{@render render_children(node.children)}
</li>
