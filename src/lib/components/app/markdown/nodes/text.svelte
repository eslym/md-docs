<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';

	let {
		node
	}: {
		node: MarkdownNodeMap['text'];
	} = $props();
</script>

{node.value}
