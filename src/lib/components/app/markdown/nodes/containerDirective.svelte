<script lang="ts">
	import { directives } from '../directives';
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ContainerDirective } = $props();

	let Component = $derived(directives.container[node.name]);
</script>

{#if Component}
	<Component {node} />
{:else}
	<div data-directive={node.name}>
		{@render render_children(node.children)}
	</div>
{/if}
