<script lang="ts" module>
	export const ShikiContext = new Context<{
		highlighter?: HighlighterCore;
	}>('shiki context');
</script>

<script lang="ts">
	import Hast from '$lib/components/app/hast.svelte';
	import { code_to_hast, shiki as load_shiki } from '$lib/shiki';
	import type { HighlighterCore } from 'shiki/core';
	import { onMount } from 'svelte';
	import { Context } from 'runed';

	const _ctx: ReturnType<typeof ShikiContext.get> = $state({});
	const ctx = ShikiContext.getOr(_ctx);

	let { code, lang = 'text' }: { code: string; lang?: string } = $props();

	onMount(async () => {
		const shiki = await load_shiki(lang);
		ctx.highlighter ??= shiki;
	});
</script>

{#if ctx.highlighter}
	{@const root = code_to_hast(code, lang, ctx.highlighter)}
	<Hast node={root} />
{:else}
	<pre class={lang}><code>{code}</code></pre>
{/if}
