<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';
	let { node }: { node: MD.FootnoteDefinition } = $props();
</script>

<li id={node.domId}>{@render render_children(node.children)}</li>
