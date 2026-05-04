<script lang="ts" module>
	const align_map = new Map([
		['left', 'text-left'],
		['center', 'text-center'],
		['right', 'text-right']
	]);
</script>

<script lang="ts">
	import { TableContext, IndexContext } from '../context';

	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let {
		node
	}: {
		node: MD.TableCell;
	} = $props();

	const table = TableContext.get();
	const arr = IndexContext.get();

	let cell = $derived(table.thead ? 'th' : 'td');
	let align = $derived(table.node.align ? (table.node.align[arr.index] ?? 'left') : 'left');
</script>

<svelte:element this={cell} class={align_map.get(align)}
	>{@render render_children(node.children)}</svelte:element
>
