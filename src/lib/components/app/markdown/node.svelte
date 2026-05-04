<script lang="ts" module>
	export { render_children };
</script>

<script lang="ts">
	import { get_renderer } from './nodes';
	import type { MD } from '@eslym/markdown';
	import Self from './node.svelte';
	import { IndexContext } from './context';

	let {
		node
	}: {
		node: MD.Nodes;
	} = $props();

	let Render = $derived(get_renderer(node));
</script>

{#snippet render_children(nodes: MD.Nodes[])}{#each nodes as child, i}<IndexContext.Provider
			index={i}><Self node={child} /></IndexContext.Provider
		>{/each}{/snippet}

{#key Render}<Render {node} />{/key}
