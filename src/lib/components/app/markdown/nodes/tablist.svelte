<script lang="ts">
	import { render_children } from '../node.svelte';
	import * as Card from '$lib/components/ui/card';
	import * as Tabs from '$lib/components/ui/tabs';
	import { Slugger } from '$lib/markdown';
	import type { MD } from '@eslym/markdown';
	import { PersistedState } from 'runed';

	let { node }: { node: MD.TabList } = $props();

	let empheral = $state({ current: '' });

	let active = $derived.by(() => {
		if (!node.key) return empheral;
		switch (node.storage) {
			case 'local':
				return new PersistedState(`tablist-${node.key}`, '');
			case 'session':
				return new PersistedState(`tablist-${node.key}`, '', { storage: 'session' });
			default:
				return empheral;
		}
	});

	let values = $derived.by(() => {
		const slugger = new Slugger();
		return node.children.map((child) => slugger.slug(child.title));
	});

	$effect.pre(() => {
		if (!values.includes(active.current)) {
			active.current = values[0] || '';
		}
	});
</script>

<Tabs.Root bind:value={active.current}>
	<Card.Root>
		<Card.Header>
			<Card.Action>
				<Tabs.List>
					{#each node.children as tab, index}
						<Tabs.Trigger value={values[index]} id={tab.id ?? undefined}>{tab.title}</Tabs.Trigger>
					{/each}
				</Tabs.List>
			</Card.Action>
		</Card.Header>
		<Card.Content>
			{#each node.children as tab, index}
				<Tabs.Content value={values[index]}>
					{@render render_children(tab.children)}
				</Tabs.Content>
			{/each}
		</Card.Content>
	</Card.Root>
</Tabs.Root>
