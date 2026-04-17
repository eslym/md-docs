<script lang="ts">
	import type { Root, RootContent } from 'hast';
	import Self from './hast.svelte';

	let { node }: { node: Root | RootContent } = $props();
</script>

{#if node.type === 'element'}<svelte:element this={node.tagName} {...node.properties}
		>{#each node.children as child}<Self node={child} />{/each}</svelte:element
	>{:else if node.type === 'text'}{node.value}{:else if node.type === 'root'}{#each node.children as child}<Self
			node={child}
		/>{/each}{/if}
