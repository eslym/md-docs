<script lang="ts" module>
	function normalize(str: string) {
		return str.trim().replace(/\s+/g, ' ');
	}
</script>

<script lang="ts">
	import type { Mermaid } from '$lib/mermaid';
	import type { HighlighterCore } from 'shiki/core';
	import AppMain from './app-main.svelte';
	import AppHeader from './app-header.svelte';

	let { data } = $props();

	let history = $state({
		mermaid: new Map<string, string>()
	});

	let mermaid_instance: Mermaid | undefined = $state(undefined);
	let shiki_instance: HighlighterCore | undefined = $state(undefined);
</script>

<svelte:head></svelte:head>

<AppHeader title="" />

<AppMain>
	<section class="mx-auto my-16 prose px-4 md:prose-lg md:px-6 print:max-w-full"></section>
</AppMain>
