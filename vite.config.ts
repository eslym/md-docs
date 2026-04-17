import tailwindcss from '@tailwindcss/vite';
import devtoolsJson from 'vite-plugin-devtools-json';
import { sveltekit } from '@sveltejs/kit/vite';
import { defineConfig } from 'vite';
import { xxhash_plugin } from './src/vite/xxhash';

export default defineConfig({
	plugins: [tailwindcss(), sveltekit(), devtoolsJson(), xxhash_plugin]
});
