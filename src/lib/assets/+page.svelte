<script lang="ts">
    import { page } from '$app/stores';
    import Chapter from 'bookish-press/components/page/Chapter.svelte';
    import { getEdition } from 'bookish-press/components/page/Contexts';

    const edition = getEdition();
    const chapter = $edition?.getChapter($page.params.chapterid);
</script>

{#if chapter}
    <Chapter {chapter} />
{/if}
