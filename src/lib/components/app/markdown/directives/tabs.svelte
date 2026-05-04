<script lang="ts" module>
	export const type = 'container';
	export const name = 'tabs';
</script>

<script lang="ts">
	import type { MD } from '@eslym/markdown';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { render_children } from '../node.svelte';
	import { PersistedState } from 'runed';
	import { Slugger } from '$lib/markdown';
	let { node }: { node: MD.ContainerDirective } = $props();

	let componentId = $props.id();

	let dataStore = $derived(node.attributes?.store);
	let dataKey = $derived(node.attributes?.key);

	let tabs = $derived.by(() => {
		const slugger = new Slugger();
		const tabs: { title: string; id: string; children: MD.Nodes[] }[] = [];
		for (const child of node.children) {
			if (child.type === 'containerDirective' && child.name === 'tab') {
				if (!child.attributes?.title) {
					console.warn('Tab directive is missing title attribute, skipping', child);
					continue;
				}
				let id: string;
				if (child.attributes.id) {
					slugger.touch((id = child.attributes.id));
				} else {
					id = slugger.slug(child.attributes.title);
				}
				tabs.push({
					title: child.attributes.title,
					id,
					children: child.children
				});
			}
		}
		return tabs;
	});

	let empheral = $state({ current: '' });
	let active = $derived.by(() => {
		if (!dataKey) return empheral;
		return dataStore === 'session'
			? new PersistedState(`tabs-${dataKey}`, '', { storage: 'session' })
			: new PersistedState(`tabs-${dataKey}`, '');
	});

	$effect.pre(() => {
		if (tabs.length && !tabs.find((tab) => tab.id === active.current)) {
			active.current = tabs[0]!.id ?? '';
		}
	});
</script>

<Tabs.Root bind:value={active.current}>
	<Card.Root>
		<Card.Header>
			<Card.Action role="tablist">
				{#each tabs as tab}
					<Tabs.Trigger id="{componentId}-{tab.id}" value={tab.id} role="tab"
						>{tab.title}</Tabs.Trigger
					>
				{/each}
			</Card.Action>
		</Card.Header>
		<Card.Content>
			{#each tabs as tab}
				<Tabs.Content value={tab.id} role="tabpanel" aria-labelledby="{componentId}-{tab.id}">
					{@render render_children(tab.children)}
				</Tabs.Content>
			{/each}
		</Card.Content>
	</Card.Root>
</Tabs.Root>
