export const prerender = true;

import spec from '$lib/assets/edition.json';
import { EditionModel } from 'bookish-press';
import type { EditionSpecification } from 'bookish-press/dist/models/book/Edition.js';
import type { PageLoad } from './$types.js';

export const load: PageLoad = function ({ params }) {
    // Get the edition from the assets.
    const edition = EditionModel.fromJSON(
        undefined,
        spec as unknown as EditionSpecification,
    );

    return {
        chapter: edition.getChapter(params.chapterid),
    };
};
