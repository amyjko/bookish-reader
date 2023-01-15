<script lang="ts">
    import { Edition } from 'bookish-press';
    import { default as EditionModel } from 'bookish-press/models/book/Edition';
    import book from '$lib/assets/book/book.json';
    import { writable } from 'svelte/store';
    import { setContext } from 'svelte';
    import { EDITION } from 'bookish-press';

    const edition = EditionModel.fromJSON(undefined, book);

    setContext(EDITION, writable<EditionModel>(edition));
</script>

<Edition {edition} editable={false}>
    <slot />
</Edition>
