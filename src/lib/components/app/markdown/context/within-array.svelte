<script lang="ts" module>
	export const IndexContext = Object.assign(
		new Context<{
			readonly index: number;
		}>('table'),
		{
			Provider: Self
		}
	);
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
