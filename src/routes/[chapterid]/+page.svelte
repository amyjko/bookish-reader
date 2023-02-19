<script lang="ts">
    import type { default as ChapterModel } from 'bookish-press/package/models/book/Chapter';
    import Chapter from 'bookish-press/package/components/page/Chapter.svelte';
    import Unknown from 'bookish-press/package/components/page/Unknown.svelte';
    import { page } from '$app/stores';
    import { getEdition } from 'bookish-press/package/components/page/Contexts';

    export let data: { chapter: ChapterModel | undefined } | undefined;

    let edition = getEdition();

    // Resolve the chapter either with the server side data or the edition context if that doesn't exist.
    $: chapter =
        data?.chapter ??
        $edition?.getChapter($page.params.chapterid.replace('.html', ''));
</script>

{#if chapter}
    <Chapter {chapter} />
{:else}
    <Unknown
        >No chapter by the name <code>{$page.params.chapterid}</code> exists.</Unknown
    >
{/if}
