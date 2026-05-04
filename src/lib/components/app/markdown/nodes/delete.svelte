<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Delete } = $props();
</script>

<del>{@render render_children(node.children)}</del>
