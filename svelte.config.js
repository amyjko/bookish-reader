import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/vite-plugin-svelte';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    preprocess: vitePreprocess(),

    kit: {
        adapter: adapter({
            fallback: '404.html',
        }),
        paths: {
            // Base path for this build. Driven by an env var so the binder can
            // build multiple editions (each under its own sub-path) sequentially
            // from a single checkout. Empty string serves the book at the root.
            base: process.env.BASE_PATH ?? '',
        },
    },
};

export default config;
