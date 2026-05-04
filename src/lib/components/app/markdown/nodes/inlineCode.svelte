<script lang="ts">
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.InlineCode } = $props();
</script>

<code>{node.value}</code>
