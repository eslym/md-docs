<script lang="ts" module>
	const ctx = new Context<{
		readonly node: MD.Table;
		readonly thead: boolean;
	}>('table');
	Object.defineProperty(ctx, 'Provider', {
		get: () => Self
	});
	export const TableContext = ctx as typeof ctx & {
		Provider: typeof Self;
	};
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
