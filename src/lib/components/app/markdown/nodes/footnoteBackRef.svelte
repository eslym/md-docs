<script lang="ts">
	import type { MD } from '@eslym/markdown';
	import { CornerRightUpIcon } from '@lucide/svelte';
	let { node }: { node: MD.FootnoteBackRef } = $props();
</script>

<a href="#{node.id}"
	><CornerRightUpIcon class="inline-block size-3" /><span class="sr-only">
		Back to reference
	</span></a
>
