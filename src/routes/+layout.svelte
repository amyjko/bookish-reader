<script lang="ts">
    import { Edition } from 'bookish-press';
    import { default as EditionModel } from 'bookish-press/models/book/Edition';
    import spec from '$lib/assets/edition.json';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import { EDITION } from 'bookish-press';

    const edition = EditionModel.fromJSON(undefined, spec);

    setContext(EDITION, writable<EditionModel>(edition));
</script>

<Edition {edition}>
    <slot />
</Edition>
