import {
    readFileSync,
    readdirSync,
    writeFileSync,
    mkdirSync,
    copyFileSync,
    existsSync,
    statSync,
} from 'fs';
import path from 'path';
import Ajv from 'ajv';
import addFormats from 'ajv-formats';
import Schema from 'bookish-press/models/book/Schema';
import type { ChapterSpecification } from 'bookish-press/models/book/Chapter';
import { execSync } from 'child_process';
import sharp from 'sharp';

const bookPath = process.argv[2];

if (bookPath === undefined) {
    cleanAndExit('I need a path to the book.json file to render.');
}

const bookData = readFileSync(bookPath, 'utf8');
const bookJSON = JSON.parse(bookData);

console.log("Let's make sure this is a valid book...");

const validator = new Ajv({
    strictTuples: false,
    allErrors: true,
    allowUnionTypes: true,
});
addFormats(validator);

const valid = validator.validate(Schema, bookJSON);

if (!valid) {
    console.error('Uh oh, the book JSON has some problems.');
    console.error(validator.errors);
    cleanAndExit('Fix them, then try again.');
}

console.log(
    "Found your book! Let's check the chapters/ folder for chapters..."
);

const bookFolderPath = path.dirname(bookPath);
const chaptersPath = `${bookFolderPath}/chapters`;

if (!existsSync(chaptersPath)) {
    cleanAndExit('There is no chapters/ folder');
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
            cleanAndExit(`Couldn't find the chapter with ID ${chapterID}`);
        }
    }
}

console.log("Let's make sure we found the text for each chapter...");

let foundAll = true;
for (const chapter of bookJSON.chapters) {
    if (chapter.text === undefined) {
        console.error(
            `Couldn't find text of chapter "${chapter.id}". Are you sure there's a file "chapters/${chapter.id}.bd"?`
        );
        foundAll = false;
    }
}

if (!foundAll) {
    cleanAndExit(
        "Quitting, couldn't find all the chapter text. Check the errors above."
    );
}

console.log('Found the text for every chapter in the book.');

console.log(
    'Grabbing any images in images/ and preparing them for bundling...'
);

const imagesPath = `${bookFolderPath}/images`;

if (existsSync(imagesPath)) {
    const destinationImagesPath = `static/images`;
    const destinationSmallImagesPath = `${destinationImagesPath}/small`;
    // Make an images path in src/static/images
    if (!existsSync(destinationImagesPath)) mkdirSync(destinationImagesPath);
    // Make a small images path in src/static/images/small
    if (!existsSync(destinationSmallImagesPath))
        mkdirSync(destinationSmallImagesPath);

    const possibleImageFiles = readdirSync(imagesPath, 'utf8');
    for (const image of possibleImageFiles) {
        const imagePath = `${imagesPath}/${image}`;
        if (statSync(imagePath).isFile()) {
            console.log(`Copying ${image}...`);
            copyFileSync(imagePath, `${destinationImagesPath}/${image}`);

            // Resizing image
            try {
                await sharp(imagePath)
                    .resize(320)
                    .toFile(`${destinationImagesPath}/small/${image}`);
            } catch (err) {
                cleanAndExit('Unable to save resized image');
            }
        }
    }
} else {
    console.log('No images path, not adding any images.');
}

console.log(
    "We have a complete record of the book and have generated it's images. Writing the updated edition.json file to assets."
);

writeFileSync('src/lib/assets/edition.json', JSON.stringify(bookJSON, null, 3));

if (bookJSON.base) {
    console.log(
        `Looks like you want your book hosted at '${bookJSON.base}' on your website. I'll configure that.`
    );

    let base = bookJSON.base;

    if (base.endsWith('/')) base = base.substring(0, base.length - 1);
    if (base.charAt(0) !== '/') base = `/${base}`;

    const svelteConfigPath = 'svelte.config.js';
    let config = readFileSync(svelteConfigPath, 'utf8');
    writeFileSync(
        svelteConfigPath,
        config.replace("base: ''", `base: '${base}'`)
    );
}

console.log('Building the book...');

execSync('npm run build', { stdio: 'inherit' });

console.log('Cleaning up...');

// clean();

console.log('You can find your bound book in the "build" folder.');

function cleanAndExit(error: string) {
    console.log(error);
    clean();
    process.exit(1);
}

function clean() {
    // execSync('git reset', { stdio: 'inherit' });
    // execSync('git checkout', { stdio: 'inherit' });
    // execSync('git clean -fd', { stdio: 'inherit' });
}
