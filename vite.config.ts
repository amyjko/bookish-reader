import { sveltekit } from '@sveltejs/kit/vite';
import { readFileSync, writeFileSync } from 'fs';
import type { UserConfig } from 'vite';

const patchSvelteKitTsconfig = {
	name: 'patch-svelte-kit-tsconfig',
	buildStart() {
		const path = '.svelte-kit/tsconfig.json';
		try {
			const tsconfig = JSON.parse(readFileSync(path, 'utf8'));
			delete tsconfig.compilerOptions.importsNotUsedAsValues;
			delete tsconfig.compilerOptions.preserveValueImports;
			tsconfig.compilerOptions.verbatimModuleSyntax = true;
			writeFileSync(path, JSON.stringify(tsconfig, null, '\t'));
		} catch {
			// .svelte-kit/tsconfig.json not yet generated; sveltekit() will create it
		}
	}
};

const config: UserConfig = {
	plugins: [sveltekit(), patchSvelteKitTsconfig]
};

export default config;
