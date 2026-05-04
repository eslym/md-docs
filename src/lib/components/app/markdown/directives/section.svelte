<script lang="ts" module>
	export const type = 'container';
	export const name = 'section';
</script>

<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ContainerDirective } = $props();
</script>

<section id={node.attributes?.id} class="break-after-page">
	{@render render_children(node.children)}
</section>
