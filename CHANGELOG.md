# Bookish Reader change log

## 0.3.0 2026-09-02

- Migrated to Svelte 5 and Bookish 0.8.2 (`bookish-press@^0.8.2`, which requires Svelte 5), moving the routes to runes and snippets.
- Upgraded the toolchain: SvelteKit 1 to 2, Vite 4 to 7, `@sveltejs/adapter-static` 2 to 3, `svelte-check` 3 to 4, and `prettier-plugin-svelte` 3 to 4; replaced `svelte-preprocess` with `vitePreprocess` and removed the SvelteKit 1-era tsconfig patch plugin.
- Updated `sharp` to ^0.34 (0.31 predates current Node versions) and `ajv-formats` to ^3; removed `@types/sharp` (sharp ships its own types) and the unused `ts-node`.
- Binding the example book now produces a correct `og:image` for social previews and no stray prerendered page, thanks to the cover-URL fix in Bookish 0.8.2.

## 0.2.45 2026-07-20

- Added support for multiple coexisting editions. Pass an `editions.json` manifest (an array of editions, each with its own `book.json`/`chapters` and `base` sub-path) instead of a single `book.json`, and the binder builds every edition into one deploy directory with a reader-side edition picker that links across them. Editions can share an image pool: images in an `images/` folder next to the manifest are used by every edition, and each edition's own `images/` folder adds to or overrides them. Single-book builds are unchanged.

## 0.2.44 2026-05-02

- Updated to Bookish 0.7.4.

## 0.2.43 2025-05-17

- Updated to Bookish 0.7.1.

## 0.2.43 2024-04-21

- Updated to Bookish 0.6.54.

## 0.2.42 2024-04-21

- Updated to Bookish 0.6.53.

## 0.2.41 2023-11-18

- Updated to Bookish 0.5.73.

## 0.2.40 2023-11-18

- Updated minor versions.
- Updated to Bookish 0.5.7.

## 0.2.31 2023-07-29

- Updated to Bookish 0.5.62
- Updated minor versions of other dependencies

## 0.2.3 2023-06-24

- Updated to Bookish 0.5.5
- Updated to Svelte 4, for smaller books.

## 0.2.2 2023-06-17

- Updated to Bookish 0.5.32

## 0.2.1 2022-03-11

- Created change log
- Pulled bug fixes from `bookish-press` package
- Updated Sveltekit to `1.11`
