<script lang="ts">
	import { MarkdownRenderContext } from '../context/markdown';
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.Link } = $props();

	const ctx = MarkdownRenderContext.get();
	let resolved_link = $derived(ctx.resolveLink(node.url));
	let href = $derived(resolved_link?.href ?? node.url);
	let target = $derived(resolved_link?.target);
</script>

<a {href} {target} title={node.title ?? undefined}>{@render render_children(node.children)}</a>
