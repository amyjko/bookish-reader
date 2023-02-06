export const prerender = true;

import spec from '$lib/assets/edition.json';
import Edition from 'bookish-press/models/book/Edition';
import type { EditionSpecification } from 'bookish-press/models/book/Edition';

/** @type {import('./$types').LayoutLoad} */
/** Load the edition, but from disk. This enables full prerendering. */
export function load() {
    return {
        edition: Edition.fromJSON(
            undefined,
            spec as unknown as EditionSpecification
        ),
    };
}
