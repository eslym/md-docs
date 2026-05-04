<script lang="ts" module>
	export const type = 'text';
	export const name = 'checkbox';

	const boolean = z.loose(z.coerce.boolean());
</script>

<script lang="ts">
	import { Checkbox } from '$lib/components/ui/checkbox';
	import * as z from '$lib/zod';

	import type { MD } from '@eslym/markdown';

	let { node }: { node: MD.TextDirective } = $props();
</script>

<Checkbox
	checked={boolean.parse(node.attributes?.checked)}
	indeterminate={boolean.parse(node.attributes?.indeterminate)}
	readonly
	class="inline-block"
/>
