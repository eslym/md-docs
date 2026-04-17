<script lang="ts">
	import { ScrollArea } from '$lib/components/ui/scroll-area';
	import { useSidebar } from '$lib/components/ui/sidebar';
	import { cn } from '$lib/utils';
	import type { Snippet } from 'svelte';
	import type { ClassValue } from 'svelte/elements';

	let {
		children,
		class: kelas,
		wrapperClass
	}: { children: Snippet; class?: ClassValue; wrapperClass?: ClassValue } = $props();

	const sidebar = useSidebar();
</script>

<ScrollArea
	class="print:*:oveflow-hidden @container flex h-0 grow *:scroll-smooth print:h-auto print:*:h-auto"
>
	<div class={cn('flex grow flex-row', wrapperClass)}>
		<div class={cn('mx-auto max-w-full', kelas)}>
			{@render children()}
		</div>
		{#if !sidebar.isMobile}
			<div
				data-state={sidebar.state}
				class="w-0 max-w-(--sidebar-width) grow transition-[max-width] duration-200 ease-linear data-[state=collapsed]:max-w-0 print:hidden"
			></div>
		{/if}
	</div>
</ScrollArea>
