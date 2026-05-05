<script lang="ts">
	import { page } from '$app/state';

	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import type { TOCEntry } from '$lib/markdown';
	import type { ComponentProps } from 'svelte';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';
	import AppMenu from './app-menu.svelte';

	let {
		ref = $bindable(null),
		app,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { app: App.Locals['app'] } = $props();

	let toc: TOCEntry[] | undefined = $derived(page.data.doc?.toc);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<img src={app.favicon} alt="favicon" class="size-8 object-contain" />
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">{app.name || 'md-docs'}</span>
								{#if app.subtitle}
									<span class="text-muted-foreground">
										{app.subtitle}
									</span>
								{/if}
							</div>
						</a>
					{/snippet}
				</Sidebar.MenuButton>
			</Sidebar.MenuItem>
		</Sidebar.Menu>
	</Sidebar.Header>
	<Sidebar.Content class="pb-8">
		{#if toc?.length}
			<Sidebar.Group>
				<Sidebar.GroupLabel>Contents</Sidebar.GroupLabel>
				<Sidebar.GroupContent>
					<Sidebar.Menu>
						{#each toc as child}
							{@render menu_item(child)}
						{/each}
					</Sidebar.Menu>
				</Sidebar.GroupContent>
			</Sidebar.Group>
		{/if}
		<AppMenu />
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>

{#snippet menu_item(entry: TOCEntry)}
	{#snippet menu_button({ props }: { props: Record<string, unknown> })}
		{@const el = entry.id ? 'a' : 'button'}
		{@const attrs = {
			...props,
			href: entry.id ? `#${entry.id}` : undefined
		}}
		<svelte:element this={el} {...attrs}>
			{entry.title}
			{#if entry.children?.length}
				<PlusIcon class="ms-auto group-data-[state=open]/collapsible:hidden" />
				<MinusIcon class="ms-auto group-data-[state=closed]/collapsible:hidden" />
			{/if}
		</svelte:element>
	{/snippet}
	<Collapsible.Root open={false} class="group/collapsible">
		{#snippet child({ props })}
			<Sidebar.MenuItem {...props}>
				{#if entry.children?.length}
					<Collapsible.Trigger>
						{#snippet child({ props })}
							<Sidebar.MenuButton
								{...props}
								isActive={Boolean(entry.id && page.url.hash === `#${entry.id}`)}
								class="h-auto py-1.5"
								child={menu_button}
							/>
						{/snippet}
					</Collapsible.Trigger>
				{:else}
					<Sidebar.MenuButton
						class="h-auto py-1.5"
						child={menu_button}
						isActive={Boolean(entry.id && page.url.hash === `#${entry.id}`)}
					/>
				{/if}
				{#if entry.children?.length}
					<Collapsible.Content>
						{#snippet child({ props })}
							<Sidebar.MenuSub {...props}>
								{#each entry.children as sub}
									{@render sub_item(sub)}
								{/each}
							</Sidebar.MenuSub>
						{/snippet}
					</Collapsible.Content>
				{/if}
			</Sidebar.MenuItem>
		{/snippet}
	</Collapsible.Root>
{/snippet}

{#snippet sub_item(entry: TOCEntry)}
	{#snippet menu_button({ props }: { props: Record<string, unknown> })}
		{@const el = entry.id ? 'a' : 'div'}
		{@const attrs = {
			...props,
			href: entry.id ? `#${entry.id}` : undefined
		}}
		<svelte:element this={el} {...attrs}>
			{entry.title}
		</svelte:element>
	{/snippet}
	<Sidebar.MenuSubItem>
		<Sidebar.MenuSubButton
			class="h-auto py-1"
			child={menu_button}
			isActive={Boolean(entry.id && page.url.hash === `#${entry.id}`)}
		/>
	</Sidebar.MenuSubItem>
{/snippet}
