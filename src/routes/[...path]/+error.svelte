<script lang="ts">
	import { page } from '$app/state';
	import { env } from '$env/dynamic/public';
	import Shiki from '$lib/components/app/markdown/features/shiki.svelte';
	import AppHeader from './app-header.svelte';
	import AppMain from './app-main.svelte';

	let error = $derived.by(() => {
		if (page.status === 500) {
			return {
				title: '500 Internal Server Error',
				...page.error!
			};
		}
		switch (page.status) {
			case 400:
				return {
					title: '400 Bad Request',
					message: 'The server could not understand the request due to invalid syntax.'
				};
			case 404:
				return {
					title: '404 Not Found',
					message: 'The page you are looking for does not exist.'
				};
			default:
				return {
					title: `${page.status}`,
					message: 'An unexpected error occurred.'
				};
		}
	});
</script>

<svelte:head>
	<title>{error.title}{env.PUBLIC_APP_TITLE_SUFFIX ?? ''}</title>
</svelte:head>

<AppHeader title={error.title} />

<AppMain>
	<section class="mx-auto my-16 prose px-4 md:prose-lg md:px-6">
		<h1>{error.title}</h1>
		<p>{error.message}</p>
		{#if error.details}
			<Shiki code={error.details} lang="ansi" />
		{/if}
	</section>
</AppMain>
