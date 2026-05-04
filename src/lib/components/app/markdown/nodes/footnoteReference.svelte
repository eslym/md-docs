<script lang="ts">
	import type { MD } from '@eslym/markdown';
	let { node }: { node: MD.FootnoteReference } = $props();
</script>

<sub id={node.domId}><a href="#{node.linkId}">[{node.label ?? node.identifier}]</a></sub>
