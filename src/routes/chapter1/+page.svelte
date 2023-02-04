<script lang="ts">
    import { page } from '$app/stores';
    import Chapter from 'bookish-press/components/page/Chapter.svelte';
    import { getEdition } from 'bookish-press/components/page/Contexts';

    const edition = getEdition();
    const path = $page.route.id;
    // Remove the / at the front
    const chapterID = path ? path.substring(1) : null;
    const chapter =
        $edition !== undefined && chapterID !== null
            ? $edition.getChapter(chapterID)
            : undefined;
</script>

{#if chapter}
    <Chapter {chapter} />
{:else if $edition !== undefined}
    Unable to find chapter {$page.params.chapterid}.
{:else}
    Chapter is not inside an edition.
{/if}
