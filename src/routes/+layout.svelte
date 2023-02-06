<script lang="ts">
    import { Edition } from 'bookish-press';
    import {
        default as EditionModel,
        type EditionSpecification,
    } from 'bookish-press/models/book/Edition';
    import spec from '$lib/assets/edition.json';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import { EDITION } from 'bookish-press';

    const edition = EditionModel.fromJSON(
        undefined,
        spec as unknown as EditionSpecification
    );

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
