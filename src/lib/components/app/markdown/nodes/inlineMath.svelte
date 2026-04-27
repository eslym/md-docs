<script lang="ts">
	import type { MD } from '@eslym/markdown';
	import { renderToString } from 'katex';

	let { node }: { node: MD.InlineMath } = $props();

	let rendered = $derived(renderToString(node.value, { throwOnError: false, displayMode: false }));
</script>

{@html rendered}
