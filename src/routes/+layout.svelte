<script lang="ts">
    import loadBook from "$lib/Loader";
    import Alert from "bookish-press/components/page/Alert.svelte"
    import Loading from "bookish-press/components/page/Loading.svelte"
    import type Edition from "bookish-press/models/book/Edition";
    import EditionView from "bookish-press/components/page/Edition.svelte"
    import { onMount } from "svelte";

    let loading = true;
    let error: string | null = null;
    let edition: Edition | undefined = undefined;
    let base: string | undefined = undefined;

    onMount(() => {
        base = new URL(document.baseURI).pathname;

        // Load the book from the folder in which the reader is hosted.
        loadBook(base)
            // If we were successful, render the book!
            .then(book => edition = book)
            .catch(err => error = err)
            .finally(() => loading = false)
    });

</script>

{#if loading}
    <Loading/>
{:else if error}
    <Alert>Unable to load the book. Here's why:</Alert>
    <code>{error}</code>
{:else if base && edition}
    <EditionView edition={edition} base={base} editable={false}>
        <slot></slot>
    </EditionView>
{/if}