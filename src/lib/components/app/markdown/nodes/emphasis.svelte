<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Emphasis } = $props();
</script>

<em>{@render render_children(node.children)}</em>
