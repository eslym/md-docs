import type { MD } from '@eslym/markdown';
import type { Component } from 'svelte';

const components = import.meta.glob('./*.svelte', { eager: true }) as Record<string, any>;

const container: Record<string, Component<{ node: MD.ContainerDirective }>> = {};
const text: Record<string, Component<{ node: MD.TextDirective }>> = {};
const leaf: Record<string, Component<{ node: MD.LeafDirective }>> = {};

export const directives = {
	container,
	text,
	leaf
};

for (const module of Object.values(components)) {
	if (module.type in directives && module.name) {
		directives[module.type as keyof typeof directives][module.name] = module.default;
	}
}
