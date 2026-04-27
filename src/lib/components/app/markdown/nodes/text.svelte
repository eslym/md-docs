<script lang="ts">
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Text } = $props();
</script>

{node.value}
