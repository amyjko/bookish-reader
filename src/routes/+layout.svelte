<script lang="ts">
    import Edition from 'bookish-press/package/components/page/Edition.svelte';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import { EDITION } from 'bookish-press/package/components/page/Contexts';
    import type { default as EditionModel } from 'bookish-press/package/models/book/Edition';

    export let data: { edition: EditionModel };

    const { edition } = data;

    let base = edition.base ?? '';
    // Strip trailing slash if provided.
    if (base.length > 0 && base.endsWith('/'))
        base = base.substring(0, base.length - 1);
    // Prepend slash if not provided.
    if (base.length > 0 && base.charAt(0) !== '/') base = '/' + base;

    setContext(EDITION, writable<EditionModel>(edition));
</script>

<Edition {edition} {base}>
    <slot />
</Edition>
