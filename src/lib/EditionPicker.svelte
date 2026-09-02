<script lang="ts">
    let {
        /** Public metadata for every edition, written to assets by build.js. */
        editions = [],
        /** The normalized base path of the edition currently being viewed. */
        current = '',
    }: {
        editions?: {
            number: number;
            summary: string;
            base: string;
            published: number | string | null;
        }[];
        current?: string;
    } = $props();

    // Each edition is a separate static build under its own base path, so the
    // picker only shows for multi-edition books and links across builds.
    let normalizedCurrent = $derived(normalize(current));

    function normalize(base: string) {
        let b = base ?? '';
        if (b === '' || b === '/') return '';
        if (b.endsWith('/')) b = b.substring(0, b.length - 1);
        if (b.charAt(0) !== '/') b = '/' + b;
        return b;
    }

    function ordinal(n: number) {
        const suffixes = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return n + (suffixes[(v - 20) % 10] || suffixes[v] || suffixes[0]);
    }

    function label(edition: { number: number; summary: string }) {
        return edition.summary && edition.summary.trim().length > 0
            ? edition.summary
            : `${ordinal(edition.number)} edition`;
    }

    // Link to the root of each edition's build. A full page load is required
    // because the target lives outside this build's client router base.
    function href(base: string) {
        return (normalize(base) || '') + '/';
    }
</script>

{#if editions.length > 1}
    <nav class="edition-picker" aria-label="Editions">
        <span class="edition-picker-label">Editions:</span>
        <ul>
            {#each editions as edition (edition.number)}
                <li>
                    {#if normalize(edition.base) === normalizedCurrent}
                        <span aria-current="true">{label(edition)}</span>
                    {:else}
                        <!-- rel="external" so SvelteKit's prerender crawler skips
                             this cross-build link and the browser does a full page
                             load into the other edition's separate build. -->
                        <a href={href(edition.base)} rel="external"
                            >{label(edition)}</a
                        >
                    {/if}
                </li>
            {/each}
        </ul>
    </nav>
{/if}

<style>
    .edition-picker {
        display: flex;
        flex-wrap: wrap;
        align-items: baseline;
        gap: 0.5em;
        padding: 0.5em 1em;
        font-family: var(--bookish-paragraph-font-family);
        font-size: calc(var(--bookish-paragraph-font-size) * 0.85);
        border-bottom: 1px solid var(--bookish-border-color-light);
    }

    .edition-picker-label {
        color: var(--bookish-muted-color);
    }

    .edition-picker ul {
        display: flex;
        flex-wrap: wrap;
        gap: 0.25em 1em;
        margin: 0;
        padding: 0;
        list-style: none;
    }

    .edition-picker a {
        color: var(--bookish-link-color);
        font-weight: var(--bookish-link-font-weight);
    }

    .edition-picker [aria-current='true'] {
        color: var(--bookish-paragraph-color);
        font-weight: var(--bookish-bold-font-weight);
    }
</style>
