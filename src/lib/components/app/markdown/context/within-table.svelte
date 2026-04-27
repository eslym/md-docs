<script lang="ts" module>
	export const TableContext = Object.assign(
		new Context<{
			readonly node: MD.Table;
			readonly thead: boolean;
		}>('table'),
		{
			Provider: Self
		}
	);
</script>

<script lang="ts">
	import { Context } from 'runed';
	import Self from './within-table.svelte';
	import type { MD } from '@eslym/markdown';
	import type { Snippet } from 'svelte';

	let {
		node,
		children,
		thead = false
	}: { node: MD.Table; children: Snippet<[]>; thead?: boolean } = $props();

	TableContext.set({
		get node() {
			return node;
		},
		get thead() {
			return thead;
		}
	});
</script>

{@render children()}
