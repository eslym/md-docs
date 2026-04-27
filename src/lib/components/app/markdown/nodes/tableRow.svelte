<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let {
		node
	}: {
		node: MD.TableRow;
	} = $props();
</script>

<tr>
	{@render render_children(node.children)}
</tr>
