<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { IsMobile } from '$lib/hooks/is-mobile.svelte';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		children,
		class: kelas,
		wrapperClass
	}: { children: Snippet; class?: ClassValue; wrapperClass?: ClassValue } = $props();

	const isMobile = new IsMobile();
</script>

<ScrollArea class="*:scroll-smooth @container flex h-0 grow">
	<div class={cn('flex grow flex-row', wrapperClass)}>
		<div class={cn('mx-auto max-w-full', kelas)}>
			{@render children()}
		</div>
		{#if !isMobile.current}
			<div
				class="w-0 max-w-(--sidebar-width) grow transition-[max-width] duration-200 ease-linear group-has-[[data-slot=sidebar][data-collapsible=offcanvas]]/sidebar-wrapper:max-w-0"
			></div>
		{/if}
	</div>
</ScrollArea>
