<script lang="ts">
    import { page } from '$app/stores';
    import Chapter from 'bookish-press/components/page/Chapter.svelte';
    import { getEdition } from 'bookish-press/components/page/Contexts';

    const edition = getEdition();
    const path = $page.route.id;
    // Strip the / from the front and end of the the path.
    const chapterID = path ? path.substring(1) : null;
    const chapter =
        $edition !== undefined && chapterID !== null
            ? $edition.getChapter(chapterID)
            : undefined;
</script>

{#if chapter}
    <Chapter {chapter} />
{:else if $edition !== undefined}
    Unable to find chapter {chapterID}.
{:else}
    Chapter is not inside an edition.
{/if}
