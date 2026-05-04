<script lang="ts">
	import { render_children } from '../node.svelte';
	import { MarkdownRenderContext } from '../context';
	import type { MD } from '@eslym/markdown';
	let { node }: { node: MD.LinkReference } = $props();

	const ctx = MarkdownRenderContext.get();

	let def = $derived(ctx.findDefinition(node.identifier)!);

	let link = $derived(ctx.resolveLink(def.url));

	let href = $derived(link?.href ?? def.url);
	let target = $derived(link?.target);
</script>

<a {href} {target} title={def.title ?? undefined}>{@render render_children(node.children)}</a>
