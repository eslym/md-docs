<script lang="ts">
	import './layout.css';
	import { ModeWatcher } from 'mode-watcher';

	let { data, children } = $props();
</script>

<svelte:head>
	<link rel="icon" type="image/x-icon" href="/favicon.ico" />
	<link rel="icon" href={data.locals.app.favicon} />
	<link rel="stylesheet" href={data.locals.app.themeCss} />
</svelte:head>
{@render children()}

<ModeWatcher />
