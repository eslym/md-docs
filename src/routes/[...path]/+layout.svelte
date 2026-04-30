<script lang="ts">
	import * as Sidebar from '$lib/components/ui/sidebar';
	import AppSidebar from './app-sidebar.svelte';

	let { children, data } = $props();
</script>

<Sidebar.Provider class="print:**:data-[slot=sidebar]:hidden">
	<AppSidebar app={data.locals.app} />
	<Sidebar.Inset
		class="print:max-h-auto flex h-dvh max-h-dvh flex-col overflow-hidden print:h-auto"
	>
		{@render children()}
	</Sidebar.Inset>
</Sidebar.Provider>
