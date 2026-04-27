import type { Plugin } from 'vite';
import Handlebars from 'handlebars';

export const hbs_plugin = {
	name: 'hbs',
	async resolveId(source, importer) {
		if (!source.endsWith('.hbs')) return null;

		const resolved = await this.resolve(source, importer, { skipSelf: true });
		if (!resolved) return null;
		return resolved.id;
	},
	async load(id) {
		if (!id.endsWith('.hbs')) return null;

		const content = await Bun.file(id).text();
		this.addWatchFile(id);

		return `import Handlebars from 'handlebars';
const template = Handlebars.template(${Handlebars.precompile(content)});
export default template;`;
	}
} satisfies Plugin;
