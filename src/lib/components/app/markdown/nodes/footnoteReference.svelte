<script lang="ts">
	import type { MD } from '@eslym/markdown';
	let { node }: { node: MD.FootnoteReference } = $props();
</script>

<span class="align-top text-[0.6em] leading-none" id={node.domId}
	><a href={node.linkId}>{node.label ?? node.identifier}</a></span
>
