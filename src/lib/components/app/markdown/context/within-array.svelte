<script lang="ts" module>
	const ctx = new Context<{
		readonly index: number;
	}>('table');
	Object.defineProperty(ctx, 'Provider', {
		get: () => Self
	});
	export const IndexContext = ctx as typeof ctx & {
		Provider: typeof Self;
	};
</script>

<script lang="ts">
	import { Context } from 'runed';
	import Self from './within-array.svelte';
	import type { Snippet } from 'svelte';

	let { index, children }: { index: number; children: Snippet<[]> } = $props();

	IndexContext.set({
		get index() {
			return index;
		}
	});
</script>

{@render children()}
