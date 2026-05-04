<script lang="ts">
	import type { MD } from '@eslym/markdown';
	import { renderToString } from 'katex';

	let { node }: { node: MD.Math } = $props();

	let rendered = $derived(renderToString(node.value, { throwOnError: false, displayMode: true }));
</script>

<div class="flex flex-row justify-center">
	{@html rendered}
</div>
