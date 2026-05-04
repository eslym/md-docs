<script lang="ts" module>
	export function normalize_props(props: Record<string, string>) {
		return Object.fromEntries(
			Object.entries(props).map(([key, value]) => {
				if (key.toLowerCase().startsWith('on')) {
					const fn = new Function('event', value);
					return [key.toLowerCase(), (event: Event) => fn.call(event.currentTarget, event)];
				}
				return [key, value];
			})
		);
	}
</script>

<script lang="ts">
	import { render_children } from '../node.svelte';
	import { type MD, selfClosingTags } from '@eslym/markdown';

	let { node }: { node: MD.Element } = $props();

	const attrs = $derived(() => normalize_props(node.properties ?? {}));
</script>

{#if selfClosingTags.has(node.tagName)}<svelte:element
		this={node.tagName}
		{...attrs}
	/>{:else}<svelte:element this={node.tagName} {...attrs}
		>{@render render_children(node.children)}</svelte:element
	>{/if}
