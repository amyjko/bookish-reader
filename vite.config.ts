import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

// SvelteKit 2 generates a modern .svelte-kit/tsconfig.json on its own; the
// old tsconfig-patching plugin from the Kit 1 era is no longer needed.
const config: UserConfig = {
    plugins: [sveltekit()],
};

export default config;
