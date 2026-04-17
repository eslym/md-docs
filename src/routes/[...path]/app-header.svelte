<script lang="ts">
	import * as Breadcrumb from '$lib/components/ui/breadcrumb';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import { Separator } from '$lib/components/ui/separator';
	import * as DropdownMenu from '$lib/components/ui/dropdown-menu';
	import { buttonVariants } from '$lib/components/ui/button';
	import { SunIcon, MoonIcon, PaletteIcon } from '@lucide/svelte';
	import { setMode, userPrefersMode } from 'mode-watcher';

	let { title }: { title: string } = $props();

	let icons = {
		light: SunIcon,
		dark: MoonIcon,
		system: PaletteIcon
	};

	let ThemeIcon = $derived(icons[userPrefersMode.current]);
</script>

<header class="flex h-16 shrink-0 items-center gap-2 border-b print:hidden">
	<div class="flex w-full items-center gap-2 px-3">
		<Sidebar.Trigger />
		<Separator orientation="vertical" class="mx-2 h-16!" />
		<Breadcrumb.Root>
			<Breadcrumb.List>
				<Breadcrumb.Page>{title}</Breadcrumb.Page>
			</Breadcrumb.List>
		</Breadcrumb.Root>
		<Separator orientation="vertical" class="mx-2 ml-auto h-16! max-sm:hidden" />
		<DropdownMenu.Root>
			<DropdownMenu.Trigger
				class={buttonVariants({ variant: 'ghost', size: 'icon', class: 'size-7 max-sm:ml-auto' })}
			>
				<ThemeIcon />
				<span class="sr-only">Toggle theme</span>
			</DropdownMenu.Trigger>
			<DropdownMenu.Content align="end">
				<DropdownMenu.Group>
					<DropdownMenu.RadioGroup
						bind:value={() => userPrefersMode.current, (val) => setMode(val)}
					>
						<DropdownMenu.RadioItem value="system">
							<PaletteIcon class="mr-2 size-4" />
							System
						</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="light">
							<SunIcon class="mr-2 size-4" />
							Light
						</DropdownMenu.RadioItem>
						<DropdownMenu.RadioItem value="dark">
							<MoonIcon class="mr-2 size-4" />
							Dark
						</DropdownMenu.RadioItem>
					</DropdownMenu.RadioGroup>
				</DropdownMenu.Group>
			</DropdownMenu.Content>
		</DropdownMenu.Root>
	</div>
</header>
