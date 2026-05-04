<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.BlockQuote } = $props();
</script>

<blockquote>{@render render_children(node.children)}</blockquote>
