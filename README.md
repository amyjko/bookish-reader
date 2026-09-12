

# Bookish Reader

This is a companion repository to [Bookish](https://github.com/amyjko/bookish), which uses packaged components from Bookish to create a standalone Reader app that reads a `book.json` file from the root folder of the Reader, and chapters from the `chapters` folder in the root.

Assuming you have `npm` installed, bind a book as follows:

* From your book's folder, clone this repository into it: `git clone https://github.com/amyjko/bookish-reader`
* Enter it: `cd bookish-reader`
* Bind the book: `zsh bind.sh`, or `zsh bind.sh ../editions.json` for a book with more than one edition
* Copy everything in the resulting `build` folder to wherever your book is hosted.

The reader binds the book in its *parent* folder, which is why it is cloned into
your book rather than beside it.

That's it! To have your book publish itself whenever you push to it instead, see
[PUBLISHING.md](PUBLISHING.md).

*Bookish Reader is currently in beta; it is not yet ready for production.*

## How it works

Bookish is written in [SvelteKit](https://kit.svelte.dev/), and as is Bookish Reader, and so the compiled app is a SvelteKit app.
The build step above uses SvelteKit's [static adapter])(https://github.com/sveltejs/kit/tree/master/packages/adapter-static) to generate a static site. However, it makes a few assumptions about how the book will be hosted; the defaults here assume a web server that will fall back to `index.html` when a page doesn't exist, among other things. 
You may need to update some of the build settings to property configure it for your hosting environment.