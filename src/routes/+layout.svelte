<script lang="ts">
    import { Edition, EDITION, EditionModel, Analytics } from 'bookish-press';
    import { writable } from 'svelte/store';
    import { setContext, untrack, type Snippet } from 'svelte';

    let {
        data,
        children,
    }: { data: { edition: EditionModel }; children?: Snippet } = $props();

    // The edition is loaded once from the statically bound edition.json and
    // never changes, so capture it untracked.
    const edition = untrack(() => data.edition);

    // Strip the trailing slash and prepend a slash if not provided.
    const trimmed = (edition.base ?? '').replace(/\/$/, '');
    const base =
        trimmed.length > 0 && trimmed.charAt(0) !== '/'
            ? '/' + trimmed
            : trimmed;

    setContext(EDITION, writable<EditionModel>(edition));
</script>

<!-- Do book analytics for the book's analytics ID, unless there is no id -->
{#if edition.gtagid}<Analytics gtagid={edition.gtagid}></Analytics>{/if}

<Edition {edition} {base}>
    {@render children?.()}
</Edition>
