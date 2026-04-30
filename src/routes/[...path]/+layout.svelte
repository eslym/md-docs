<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from './app-sidebar.svelte';

	let { children, data } = $props();
</script>

<Sidebar.Provider class="print:**:data-[slot=sidebar]:hidden">
	<AppSidebar app={data.locals.app} />
	<Sidebar.Inset class="overflow-none h-dvh">
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
