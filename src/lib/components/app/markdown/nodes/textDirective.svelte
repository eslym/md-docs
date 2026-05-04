<script lang="ts">
	import { directives } from '../directives';
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.TextDirective } = $props();

	let Component = $derived(directives.text[node.name]);
</script>

{#if Component}
	<Component {node} />
{:else}
	<span data-directive={node.name}>{@render render_children(node.children)}</span>
{/if}
