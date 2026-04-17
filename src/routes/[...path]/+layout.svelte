<script lang="ts">
	import { env } from '$env/dynamic/public';
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from './app-sidebar.svelte';
	import favicon from '$lib/assets/favicon.svg';
	import AppMain from './app-main.svelte';

	let { children } = $props();
</script>

<Sidebar.Provider class="print:**:data-[slot=sidebar]:hidden">
	<AppSidebar favicon={env.PUBLIC_APP_FAVICON || favicon} />
	<Sidebar.Inset class="overflow-none h-dvh">
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
