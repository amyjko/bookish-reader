import {
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    copyFileSync,
    existsSync,
} from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import Schema from 'bookish-press/models/book/Schema';
import type { ChapterSpecification } from 'bookish-press/models/book/Chapter';
import { execSync } from 'child_process';

const bookPath = process.argv[2];

if (bookPath === undefined) {
    console.error('I need a path to the book.json file to render.');
    process.exit(1);
}

const bookData = readFileSync(bookPath, 'utf8');
const bookJSON = JSON.parse(bookData);

console.error("Let's make sure this is a valid book...");

const validator = new Ajv({
    strictTuples: false,
    allErrors: true,
    allowUnionTypes: true,
});
addFormats(validator);

const valid = validator.validate(Schema, bookJSON);

if (!valid) {
    console.error('Uh oh, the book JSON has some problems.');
    console.log(validator.errors);
    process.exit(1);
}

console.log(
    "Found your book! Let's check the chapters/ folder for chapters..."
);

const bookFolderPath = path.dirname(bookPath);
const chaptersPath = `${bookFolderPath}/chapters`;

if (!existsSync(chaptersPath)) {
    console.error('There is no chapters/ folder');
    process.exit(1);
}

const possibleChapterFiles = readdirSync(chaptersPath, 'utf8');

for (const file of possibleChapterFiles) {
    if (file.endsWith('.bd')) {
        const chapterID = file.split('.')[0];
        console.log(`Found chapter ${file}`);
        const chapterText = readFileSync(`${chaptersPath}/${file}`, 'utf8');
        let matchingChapter: ChapterSpecification | undefined = undefined;
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
            console.error(`Couldn't find the chapter with ID ${chapterID}`);
            process.exit(1);
        }
    }
}

console.log("Let's make sure we found the text for each chapter...");

let foundAll = true;
for (const chapter of bookJSON.chapters) {
    if (chapter.text === undefined) {
        console.error(
            `Couldn't find text of chapter ${chapter.id}. Are you sure there's a file named ${chapter.id}.bd in the same folder as ${bookPath}?`
        );
        foundAll = false;
    }
}

if (!foundAll) {
    console.error(
        "Quitting, couldn't find all the chapter text. Check the errors above."
    );
    process.exit(1);
}

console.log(
    'Grabbing any images in images/ and preparing them for bundling...'
);

const imagesPath = `${bookFolderPath}/images`;

if (existsSync(imagesPath)) {
    const destinationImagesPath = `static/images`;
    // Make an images path in src/static/images
    mkdirSync(destinationImagesPath);

    const possibleImageFiles = readdirSync(imagesPath, 'utf8');
    for (const image of possibleImageFiles) {
        console.log(`Copying ${image}...`);
        copyFileSync(image, destinationImagesPath);
    }
} else {
    console.log('No images path, not adding any images.');
}

console.log(
    "Now that we have all of the chapters, let's build the page for each chapter..."
);

for (const chapter of bookJSON.chapters) {
    const routePath = `src/routes/${chapter.id}`;
    mkdirSync(routePath);
    // Copy the +page.svelte template from the assets folder.
    copyFileSync(`src/lib/assets/+page.svelte`, `${routePath}/+page.svelte`);
}

console.log(
    'Okay, we matched all of the chapters to their text. Writing the updated edition.json file.'
);

writeFileSync('src/lib/assets/edition.json', JSON.stringify(bookJSON, null, 3));

console.log('Building the book...');

execSync('npm run build', { stdio: 'inherit' });

console.log('Cleaning up...');

execSync('git reset', { stdio: 'inherit' });
execSync('git checkout', { stdio: 'inherit' });
execSync('git clean -fd', { stdio: 'inherit' });

console.log('You can find your bound book in the "build" folder.');
