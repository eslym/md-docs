import type { Plugin } from 'vite';

export const xxhash_plugin = {
	name: 'hash-query',
	enforce: 'pre',
	async resolveId(source, importer) {
		if (!source.includes('?xxhash32')) return null;

		const [rawPath, query = ''] = source.split('?', 2);
		const params = new URLSearchParams(query);
		if (!params.has('xxhash64')) return null;

		const resolved = await this.resolve(rawPath, importer, { skipSelf: true });
		if (!resolved) return null;

		return `${resolved.id}?xxhash64`;
	},
	async load(id) {
		if (!id.endsWith('?xxhash64')) return null;

		const fileId = id.slice(0, -'?xxhash64'.length);

		// ignore virtual modules
		if (fileId.startsWith('\0')) return null;

		const buf = await Bun.file(fileId).arrayBuffer();
		this.addWatchFile(fileId);

		const xxhash = Bun.hash.xxHash64(buf);

		return `export default ${xxhash.toString(10)}n;`;
	}
} satisfies Plugin;
