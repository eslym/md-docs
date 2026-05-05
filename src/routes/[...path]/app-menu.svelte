<script lang="ts" module>
	function resolve_entry(
		entry: { href: string; target?: '_blank' | '_self' | '_parent' | '_top' },
		origin: string
	) {
		if (!URL.canParse(entry.href, origin)) {
			return entry;
		}
		const url = new URL(entry.href, origin);
		if (entry.target) {
			return {
				href: url.origin === origin ? url.pathname + url.search + url.hash : url.href,
				target: entry.target
			};
		}
		if (url.origin === origin) {
			return {
				href: url.pathname + url.search + url.hash,
				target: '_self'
			};
		}
		return {
			href: url.href,
			target: '_blank'
		};
	}
</script>

<script lang="ts">
	import { page } from '$app/state';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';
</script>

{#if page.data.menu}
	{@const groups = Array.isArray(page.data.menu) ? page.data.menu : [page.data.menu]}
	{#each groups as group}
		{@const items = Array.isArray(group.items) ? group.items : [group.items]}
		<Sidebar.Group>
			<Sidebar.GroupLabel>{group.title}</Sidebar.GroupLabel>
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each items as entry}
						{@render menu_entry(entry)}
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		</Sidebar.Group>
	{/each}
{/if}

{#snippet menu_entry(entry: App.MenuEntry)}
	{#if 'href' in entry}
		<Sidebar.MenuItem>
			<Sidebar.MenuButton class="h-auto py-1.5">
				{#snippet child({ props })}
					{@const attrs = resolve_entry(entry, page.url.origin)}
					<a {...props} {...attrs}>
						{entry.title}
					</a>
				{/snippet}
			</Sidebar.MenuButton>
		</Sidebar.MenuItem>
	{:else}
		{@const items = Array.isArray(entry.items) ? entry.items : [entry.items]}
		<Collapsible.Root open={false}>
			<Sidebar.MenuItem>
				<Collapsible.Trigger>
					{#snippet child({ props })}
						<Sidebar.MenuButton {...props} class="h-auto py-1.5">
							{entry.title}
							<PlusIcon class="ms-auto group-data-[state=open]/collapsible:hidden" />
							<MinusIcon class="ms-auto group-data-[state=closed]/collapsible:hidden" />
						</Sidebar.MenuButton>
					{/snippet}
				</Collapsible.Trigger>
				<Collapsible.Content>
					{#snippet child({ props })}
						<Sidebar.MenuSub {...props}>
							{#each items as sub}
								{@render menu_sub_entry(sub)}
							{/each}
						</Sidebar.MenuSub>
					{/snippet}
				</Collapsible.Content>
			</Sidebar.MenuItem>
		</Collapsible.Root>
	{/if}
{/snippet}

{#snippet menu_sub_entry(entry: App.MenuSubEntry)}
	<Sidebar.MenuSubItem>
		<Sidebar.MenuSubButton class="h-auto py-1">
			{#snippet child({ props })}
				{@const attrs = resolve_entry(entry, page.url.origin)}
				<a {...props} {...attrs}>
					{entry.title}
				</a>
			{/snippet}
		</Sidebar.MenuSubButton>
	</Sidebar.MenuSubItem>
{/snippet}
