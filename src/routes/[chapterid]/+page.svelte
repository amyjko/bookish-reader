<script lang="ts">
    import { Unknown, Chapter } from 'bookish-press';
    import type { ChapterModel } from 'bookish-press';
    import { page } from '$app/state';
    import { getEdition } from 'bookish-press';

    let { data }: { data: { chapter: ChapterModel | undefined } | undefined } =
        $props();

    let edition = getEdition();

    let chapterid = $derived(page.params.chapterid ?? '');

    // Resolve the chapter either with the server side data or the edition context if that doesn't exist.
    let chapter = $derived(
        data?.chapter ?? $edition?.getChapter(chapterid.replace('.html', '')),
    );
</script>

{#if chapter}
    <Chapter {chapter} />
{:else}
    <Unknown>No chapter by the name <code>{chapterid}</code> exists.</Unknown>
{/if}
