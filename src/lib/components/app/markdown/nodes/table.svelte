<script lang="ts">
	import { TableContext } from '$lib/components/app/markdown/context';
	import { render_children } from '../node.svelte';
	import TableRow from './tableRow.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Table } = $props();

	let thead = $derived(node.children[0]);
	let tbody = $derived(node.children.slice(1));
</script>

<table>
	<thead>
		<TableContext.Provider {node} thead>
			<TableRow node={thead} />
		</TableContext.Provider>
	</thead>
	<tbody>
		<TableContext.Provider {node}>
			{@render render_children(tbody)}
		</TableContext.Provider>
	</tbody>
</table>
