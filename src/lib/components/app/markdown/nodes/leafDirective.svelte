<script lang="ts">
	import { directives } from '$lib/components/app/markdown/directives';
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.LeafDirective } = $props();

	let Component = $derived(directives.leaf[node.name]);
</script>

{#if Component}
	<Component {node} />
{:else}
	<p data-directive={node.name}>
		{@render render_children(node.children)}
	</p>
{/if}
