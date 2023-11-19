export const prerender = true;

import spec from '$lib/assets/edition.json';
import { EditionModel } from 'bookish-press';
import type { EditionSpecification } from 'bookish-press/Edition';

/** @type {import('./$types').LayoutLoad} */
/** Load the edition, but from disk. This enables full prerendering. */
export function load() {
    return {
        edition: EditionModel.fromJSON(
            undefined,
            spec as unknown as EditionSpecification,
        ),
    };
}
