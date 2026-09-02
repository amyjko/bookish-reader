<script lang="ts">
    import { Edition, EDITION, EditionModel, Analytics } from 'bookish-press';
    import { writable } from 'svelte/store';
    import { setContext, untrack, type Snippet } from 'svelte';
    import EditionPicker from '$lib/EditionPicker.svelte';

    let {
        data,
        children,
    }: {
        data: {
            edition: EditionModel;
            editions: {
                number: number;
                summary: string;
                base: string;
                published: number | string | null;
            }[];
        };
        children?: Snippet;
    } = $props();

    // The edition and edition list are loaded once from the statically bound
    // assets and never change, so capture them untracked.
    const { edition, editions } = untrack(() => data);

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
    <EditionPicker {editions} current={base} />
    {@render children?.()}
</Edition>
