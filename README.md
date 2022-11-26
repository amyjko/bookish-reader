

# Bookish Reader

This is a companion repository to [Bookish](https://github.com/amyjko/bookish), which uses packaged components from Bookish to create a standalone Reader app that reads a `book.json` file from the root folder of the Reader, and chapters from the `chapters` folder in the root.

Assuming you have `npm` installed, set up a book as follows:

* Install the reader `npm install bookish-reader`
* Build the reader `npm run build`
* Copy everything in the resulting `build` folder to wherever your book folder is hosted.

That's it!

*Bookish Reader is currently in beta; it is not yet ready for production.*

## How it works

Bookish is written in [SvelteKit](https://kit.svelte.dev/), and as is Bookish Reader, and so the compiled app is a SvelteKit app.
The build step above uses SvelteKit's [static adapter])(https://github.com/sveltejs/kit/tree/master/packages/adapter-static) to generate a static site. However, it makes a few assumptions about how the book will be hosted; the defaults here assume a web server that will fall back to `index.html` when a page doesn't exist, among other things. 
You may need to update some of the build settings to property configure it for your hosting environment.