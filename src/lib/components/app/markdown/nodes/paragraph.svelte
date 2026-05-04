<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Paragraph } = $props();
</script>

<p>{@render render_children(node.children)}</p>
