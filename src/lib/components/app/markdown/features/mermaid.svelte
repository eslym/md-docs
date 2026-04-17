<script lang="ts" module>
	import { Context } from 'runed';
	export const MermaidContext = new Context<{
		cache?: Map<string, string>;
		mermaid?: Mermaid;
	}>('mermaid context');
</script>

<script lang="ts">
	import { mermaid as load_mermaid, type Mermaid } from '$lib/mermaid';
	import { onDestroy } from 'svelte';

	let { code }: { code: string } = $props();

	const ctx = MermaidContext.getOr({} as ReturnType<typeof MermaidContext.get>);

	let id = $props.id();

	let svg: string | null = $state(ctx.cache?.get?.(id) ?? null);

	let last_render: string | null = $state(null);

	if (!import.meta.env.SSR) {
		$effect(() => {
			if (svg !== null && last_render === code) return;
			render(code);
		});

		onDestroy(() => {
			ctx?.cache?.delete?.(id);
		});

		async function render(code: string) {
			last_render = code;
			const result = await (ctx.mermaid ??= await load_mermaid()).render(id, code);
			if (code !== last_render) return;
			svg = result.svg;
			ctx?.cache?.set?.(id, svg);
		}
	}
</script>

{#if svg}
	{@html svg}
{:else}
	<pre class="mermaid"><code>{code}</code></pre>
{/if}
