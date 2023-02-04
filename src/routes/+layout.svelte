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

    setContext(EDITION, writable<EditionModel>(edition));
</script>

<Edition {edition}>
    <slot />
</Edition>
