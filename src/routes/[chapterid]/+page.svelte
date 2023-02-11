<script lang="ts">
    import type { default as ChapterModel } from 'bookish-press/models/book/Chapter';
    import Chapter from 'bookish-press/components/page/Chapter.svelte';
    import { Unknown } from 'bookish-press';
    import { page } from '$app/stores';

    export let data: { chapter: ChapterModel | undefined };
</script>

{#if data.chapter}
    <Chapter chapter={data.chapter} />
{:else}
    <Unknown
        >No chapter by the name <code>{$page.params.chapterid}</code> exists.</Unknown
    >
{/if}
