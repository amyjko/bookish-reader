<script lang="ts">
    import { page } from '$app/stores';
    import Chapter from 'bookish-press/components/page/Chapter.svelte';
    import { getEdition } from 'bookish-press/components/page/Contexts';

    const edition = getEdition();
    const chapterID = $page.route.id;
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
