import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';
import { sveltekit } from '@sveltejs/kit/vite';
import type { UserConfig } from 'vite';

const config: UserConfig = {
    plugins: [
        sveltekit({
            preprocess: vitePreprocess(),
            adapter: adapter({ fallback: '404.html' }),
            paths: {
                // Base path for this build. Driven by an env var so the binder can
                // build multiple editions (each under its own sub-path) sequentially
                // from a single checkout. Empty string serves the book at the root.
                base: (process.env.BASE_PATH ?? '') as '' | `/${string}`,
            },
        }),
    ],
};

export default config;
