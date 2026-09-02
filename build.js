import {
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    copyFileSync,
    existsSync,
    statSync,
    rmSync,
    cpSync,
    renameSync,
} from 'fs';
import path from 'path';
import AjvModule from 'ajv';
import addFormatsModule from 'ajv-formats';
import Schema from 'bookish-press/Schema';
import { execSync } from 'child_process';
import sharp from 'sharp';

const inputPath = process.argv[2];

if (inputPath === undefined) {
    cleanAndExit(
        'I need a path to a book.json file, or an editions.json manifest, to render.',
    );
}

const inputDir = path.dirname(inputPath);
const input = JSON.parse(readFileSync(inputPath, 'utf8'));

// An optional shared image pool next to the input. Editions can keep images that
// they all use here (one copy in the source tree) and only put edition-specific
// or overriding images in their own images/ folder. For a single book this is
// just the book's own images/ folder, so behavior is unchanged.
const sharedImagesPath = path.join(inputDir, 'images');

// The input is either a single book/edition spec (an object with a chapters
// array) or an editions manifest (an array of edition descriptors). Normalize
// both into a list of editions to build, each resolved to its spec file.
let editions;
if (Array.isArray(input)) {
    console.log(`Found an editions manifest with ${input.length} edition(s).`);
    editions = input.map((entry) => ({
        base: normalizeBase(entry.base ?? ''),
        specPath: path.join(inputDir, entry.spec),
    }));
} else {
    // Back-compat: a single book renders exactly as before, at the base declared
    // in its own spec (usually the root).
    editions = [{ base: normalizeBase(input.base ?? ''), specPath: inputPath }];
}

// Write the editions manifest that the reader's picker consumes. A single-book
// build writes an empty list so the picker stays hidden; a manifest build writes
// a client-safe copy of each edition's public metadata.
const publicManifest = Array.isArray(input)
    ? input.map((entry) => {
          // The manifest entry can carry the public metadata, but each
          // edition's own spec already declares it, so fall back there —
          // otherwise a minimal manifest silently yields labels like
          // "undefinedth edition" in the picker.
          const spec = JSON.parse(
              readFileSync(path.join(inputDir, entry.spec), 'utf8'),
          );
          return {
              number: entry.number ?? spec.number,
              summary: entry.summary ?? spec.summary,
              base: normalizeBase(entry.base ?? ''),
              published: entry.published ?? spec.published ?? null,
          };
      })
    : [];
writeFileSync(
    'src/lib/assets/editions.json',
    JSON.stringify(publicManifest, null, 3),
);

// Build each edition into its own sub-path, accumulating the outputs into
// build-final so a single deploy directory contains every edition. SvelteKit's
// static adapter strips the base prefix from output filenames and wipes build/
// on every run, so we must relocate each edition's output before the next build.
const finalDir = 'build-final';
rmSync(finalDir, { recursive: true, force: true });

for (const edition of editions) {
    await prepareEdition(edition.specPath);

    console.log(
        edition.base === ''
            ? 'Building this edition at the site root...'
            : `Building this edition at '${edition.base}'...`,
    );
    execSync('npm run build', {
        stdio: 'inherit',
        env: { ...process.env, BASE_PATH: edition.base },
    });

    // Relocate build/ into build-final(/base) before the next build wipes it.
    const target =
        edition.base === '' ? finalDir : `${finalDir}${edition.base}`;
    copyDirContents('build', target);
    console.log(`Collected this edition into ${target}.`);
}

// Swap the accumulated output in as build/ so the rest of the pipeline
// (bind.sh's `cp -r build ../build`, hosting configs) is unchanged.
rmSync('build', { recursive: true, force: true });
renameSync(finalDir, 'build');

console.log('You can find your bound book in the "build" folder.');

/**
 * Validate one edition spec, inject its chapter text and images, and write it to
 * src/lib/assets/edition.json (the single source the reader loads for this build).
 */
async function prepareEdition(specPath) {
    console.log(`\nPreparing edition from ${specPath}...`);
    console.log("Let's make sure this is a valid book...");

    const bookJSON = JSON.parse(readFileSync(specPath, 'utf8'));

    const Ajv = AjvModule;
    const addFormats = addFormatsModule.default;
    const validator = new Ajv({
        strictTuples: false,
        allErrors: true,
        allowUnionTypes: true,
    });
    addFormats(validator);

    if (!validator.validate(Schema, bookJSON)) {
        console.error('Uh oh, the book JSON has some problems.');
        console.error(validator.errors);
        cleanAndExit('Fix them, then try again.');
    }

    console.log(
        "Found your book! Let's check the chapters/ folder for chapters...",
    );

    const bookFolderPath = path.dirname(specPath);
    const chaptersPath = `${bookFolderPath}/chapters`;

    if (!existsSync(chaptersPath)) {
        cleanAndExit(`There is no chapters/ folder next to ${specPath}`);
    }

    for (const file of readdirSync(chaptersPath, 'utf8')) {
        if (file.endsWith('.bd')) {
            const chapterID = file.split('.')[0];
            console.log(`Found chapter ${file}`);
            const chapterText = readFileSync(`${chaptersPath}/${file}`, 'utf8');
            let matchingChapter = undefined;
            for (const chapter of bookJSON.chapters) {
                if (chapter.id === chapterID) {
                    matchingChapter = chapter;
                    break;
                }
            }
            if (matchingChapter) {
                console.log('Found the matching chapter!');
                matchingChapter.text = chapterText;
            } else {
                cleanAndExit(`Couldn't find the chapter with ID ${chapterID}`);
            }
        }
    }

    console.log("Let's make sure we found the text for each chapter...");

    let foundAll = true;
    for (const chapter of bookJSON.chapters) {
        if (chapter.text === undefined) {
            console.error(
                `Couldn't find text of chapter "${chapter.id}". Are you sure there's a file "chapters/${chapter.id}.bd"?`,
            );
            foundAll = false;
        }
    }

    if (!foundAll) {
        cleanAndExit(
            "Quitting, couldn't find all the chapter text. Check the errors above.",
        );
    }

    console.log('Found the text for every chapter in the book.');

    console.log(
        'Grabbing any images in images/ and preparing them for bundling...',
    );

    // Start from a clean static/images so one edition's images don't leak into
    // the next edition's build (each edition owns its images under its sub-path).
    const destinationImagesPath = 'static/images';
    const destinationSmallImagesPath = `${destinationImagesPath}/small`;
    rmSync(destinationImagesPath, { recursive: true, force: true });
    mkdirSync(destinationSmallImagesPath, { recursive: true });

    // Copy the shared pool first, then this edition's own images on top so an
    // edition can override or add to the shared images. For a single book these
    // two paths are the same folder, so it's copied once.
    const editionImagesPath = `${bookFolderPath}/images`;
    let copiedAny = await copyImages(sharedImagesPath, destinationImagesPath);
    if (path.resolve(editionImagesPath) !== path.resolve(sharedImagesPath)) {
        if (await copyImages(editionImagesPath, destinationImagesPath))
            copiedAny = true;
    }
    if (!copiedAny) console.log('No images found, not adding any images.');

    console.log('Writing the updated edition.json file to assets.');
    writeFileSync(
        'src/lib/assets/edition.json',
        JSON.stringify(bookJSON, null, 3),
    );
}

/**
 * Copy every image file in srcDir into destImages, writing a 320px thumbnail into
 * destImages/small. Returns true if any image was copied, false if srcDir is absent.
 */
async function copyImages(srcDir, destImages) {
    if (!existsSync(srcDir)) return false;
    const destSmall = `${destImages}/small`;
    let copied = false;
    for (const image of readdirSync(srcDir, 'utf8')) {
        const imagePath = `${srcDir}/${image}`;
        if (statSync(imagePath).isFile()) {
            console.log(`Copying ${image}...`);
            copyFileSync(imagePath, `${destImages}/${image}`);
            try {
                await sharp(imagePath)
                    .resize(320)
                    .toFile(`${destSmall}/${image}`);
            } catch (err) {
                cleanAndExit('Unable to save resized image');
            }
            copied = true;
        }
    }
    return copied;
}

/** Normalize a base path: '' for the root, otherwise leading slash, no trailing slash. */
function normalizeBase(base) {
    let normalized = base ?? '';
    if (normalized === '' || normalized === '/') return '';
    if (normalized.endsWith('/'))
        normalized = normalized.substring(0, normalized.length - 1);
    if (normalized.charAt(0) !== '/') normalized = `/${normalized}`;
    return normalized;
}

/** Copy the children of src into dest (creating dest), like `cp -r src/. dest/`. */
function copyDirContents(src, dest) {
    mkdirSync(dest, { recursive: true });
    for (const entry of readdirSync(src)) {
        cpSync(path.join(src, entry), path.join(dest, entry), {
            recursive: true,
        });
    }
}

function cleanAndExit(error) {
    console.log(error);
    process.exit(1);
}
