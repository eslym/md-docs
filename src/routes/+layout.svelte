<script lang="ts">
	import './layout.css';
	import theme from '$lib/assets/theme.css?url';
	import favicon from '$lib/assets/favicon.svg';
	import { ModeWatcher } from 'mode-watcher';
	import { env } from '$env/dynamic/public';

	let { children } = $props();
</script>

<svelte:head>
	<link rel="icon" href={env.PUBLIC_APP_FAVICON || favicon} />
	<link rel="stylesheet" href={env.PUBLIC_APP_THEME || theme} />
</svelte:head>
{@render children()}

<ModeWatcher />
