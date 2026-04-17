<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';

	import * as Sidebar from '$lib/components/ui/sidebar';
	import * as Collapsible from '$lib/components/ui/collapsible';
	import type { TOCEntry } from '$lib/markdown';
	import type { ComponentProps } from 'svelte';
	import { MinusIcon, PlusIcon } from '@lucide/svelte';

	let {
		ref = $bindable(null),
		favicon,
		...restProps
	}: ComponentProps<typeof Sidebar.Root> & { favicon: string } = $props();

	let toc: TOCEntry[] = $derived(page.data.doc?.toc || []);
</script>

<Sidebar.Root {...restProps} bind:ref>
	<Sidebar.Header>
		<Sidebar.Menu>
			<Sidebar.MenuItem>
				<Sidebar.MenuButton size="lg">
					{#snippet child({ props })}
						<a href="/" {...props}>
							<img src={favicon} alt="favicon" class="size-8 object-contain" />
							<div class="flex flex-col gap-0.5 leading-none">
								<span class="font-medium">{env.PUBLIC_APP_NAME || 'MD Docs'}</span>
								{#if env.PUBLIC_APP_SUBTITLE}
									<span class="text-muted-foreground">
										{env.PUBLIC_APP_SUBTITLE}
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
		{#each toc as entry}
			{@render sidebar_group(entry)}
		{/each}
	</Sidebar.Content>
	<Sidebar.Rail />
</Sidebar.Root>

{#snippet sidebar_group(entry: TOCEntry)}
	<Sidebar.Group>
		<Sidebar.GroupLabel class="h-auto py-2">
			{#snippet child({ props })}
				{#if entry.id}
					<a href={`#${entry.id}`} {...props}>
						{entry.text}
					</a>
				{:else}
					<div {...props}>
						{entry.text}
					</div>
				{/if}
			{/snippet}
		</Sidebar.GroupLabel>
		{#if entry.children?.length}
			<Sidebar.GroupContent>
				<Sidebar.Menu>
					{#each entry.children as child}
						{@render menu_item(child)}
					{/each}
				</Sidebar.Menu>
			</Sidebar.GroupContent>
		{/if}
	</Sidebar.Group>
{/snippet}

{#snippet menu_item(entry: TOCEntry)}
	{#snippet menu_button({ props }: { props: Record<string, unknown> })}
		{@const el = entry.id ? 'a' : 'button'}
		{@const attrs = {
			...props,
			href: entry.id ? `#${entry.id}` : undefined
		}}
		<svelte:element this={el} {...attrs}>
			{entry.text}
			{#if entry.children?.length}
				<PlusIcon class="ms-auto group-data-[state=open]/collapsible:hidden" />
				<MinusIcon class="ms-auto group-data-[state=closed]/collapsible:hidden" />
			{/if}
		</svelte:element>
	{/snippet}
	<Collapsible.Root open={false} class="group/collapsible">
		{#snippet child({ props })}
			<Sidebar.MenuItem {...props}>
				<div class="flex flex-row gap-0.5">
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
				</div>
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
			{entry.text}
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
