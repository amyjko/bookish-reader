import adapter from '@sveltejs/adapter-static';
import preprocess from 'svelte-preprocess';

/** @type {import('@sveltejs/kit').Config} */
const config = {
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: preprocess(),

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
