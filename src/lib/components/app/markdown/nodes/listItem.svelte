<script lang="ts" module>
	function checkbox(checked: boolean): MD.TextDirective {
		return {
			type: 'textDirective',
			name: 'checkbox',
			attributes: {
				checked: checked ? 'true' : undefined
			},
			children: []
		};
	}
</script>

<script lang="ts">
	import { render_children } from '../node.svelte';
	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.ListItem } = $props();

	// unwrap paragraph if it is not spread and the first child is a paragraph
	let children = $derived.by(() => {
		if (node.spread || node.children[0]?.type !== 'paragraph') {
			if (typeof node.checked === 'boolean') {
				if (node.children[0]?.type === 'paragraph') {
					return [
						{
							...node.children[0],
							type: 'paragraph',
							children: [checkbox(node.checked), ...node.children[0].children]
						} as MD.Paragraph,
						...node.children.slice(1)
					];
				}
				return [checkbox(node.checked), ...node.children];
			}
			return node.children;
		}
		if (typeof node.checked === 'boolean') {
			return [checkbox(node.checked), ...node.children[0].children, ...node.children.slice(1)];
		}
		return [...node.children[0].children, ...node.children.slice(1)];
	});
</script>

<li>
	{@render render_children(children)}
</li>
