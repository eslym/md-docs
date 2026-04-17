<script lang="ts">
	import type { MarkdownNodeMap } from '$lib/server/markdown';

	let {
		node
	}: {
		node: MarkdownNodeMap['codespan'];
	} = $props();
</script>

<code>{node.value}</code>
