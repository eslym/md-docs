import type { MD } from '@eslym/markdown';
import type { Component } from 'svelte';
import Comment from './comment.svelte';

const nodes = import.meta.glob('./*.svelte', { eager: true }) as Record<
	string,
	{
		default: Component<any>;
	}
>;

export function get_renderer(
	node: MD.Nodes
): Component<{ node: MD.Nodes; index?: number; meta?: any }> {
	const name = node.type;
	const component = nodes[`./${name}.svelte`];
	if (component) {
		return component.default;
	}
	console.warn(`No renderer found for node type "${name}", using comment renderer as fallback.`);
	return Comment as any;
}
