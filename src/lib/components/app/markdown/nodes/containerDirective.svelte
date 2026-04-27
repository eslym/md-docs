<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ContainerDirective } = $props();

	// make unknown directive render like it does not exists,
	// ignoring all attributes and just render the children.
</script>

<div data-directive={node.name}>
	{@render render_children(node.children)}
</div>
