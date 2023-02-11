export const prerender = true;

import spec from '$lib/assets/edition.json';
import Edition from 'bookish-press/models/book/Edition';
import type { EditionSpecification } from 'bookish-press/models/book/Edition';
import type { PageLoad } from './$types';

export const load: PageLoad = function ({ params }) {
    // Get the edition from the assets.
    const edition = Edition.fromJSON(
        undefined,
        spec as unknown as EditionSpecification
    );

    return {
        chapter: edition.getChapter(params.chapterid),
    };
};
