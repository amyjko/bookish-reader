# Publishing a book from GitHub

A book built with this reader can republish itself whenever you push to it. Add
one workflow to your book's repository, give it somewhere to publish to, and a
commit to `main` becomes a published book a few minutes later.

The build itself lives here, in [`publish-book.yml`](.github/workflows/publish-book.yml),
so a fix to the binder reaches every book that calls it without anyone editing a
workflow. Nothing in it is specific to a host or an author: where your book goes,
and how to reach it, are things your own repository tells it.

## What it does

1. Checks out your book, and clones this reader into it as a subdirectory — the
   same arrangement `publish.sh` makes, because the binder reads your book from
   its parent directory.
2. Installs the reader and binds your book, exactly as `bind.sh` does.
3. **Checks the result before publishing anything.** For every edition your book
   declares, it requires an `index.html`, a `404.html`, an `_app` bundle, and at
   least as many pages as the spec has chapters. A build that died partway
   through never reaches your readers — an empty one is how sites get erased.
4. Publishes, and then fetches your book's URL to prove it is actually readable.
   A successful upload is not the same as a working site.

## Publishing over SSH

For a book served from a plain web host, give it a destination, that host's
public key, and a private key authorized on it:

```yaml
name: Publish

'on':
    push:
        branches: [main]
    workflow_dispatch:

concurrency:
    group: publish-${{ github.ref }}
    cancel-in-progress: false

permissions:
    contents: read

jobs:
    publish:
        uses: amyjko/bookish-reader/.github/workflows/publish-book.yml@main
        with:
            deploy: rsync
            destination: you@example.edu:public_html/books/your-book
            known-hosts: example.edu ssh-ed25519 AAAAC3Nza...
            verify-url: https://example.edu/~you/books/your-book/
            # Apache reads its rewrite rules from here, and the upload deletes
            # anything on the server that isn't in your build.
            extra-files: .htaccess
        secrets:
            SSH_KEY: ${{ secrets.SSH_KEY }}
```

**Use a dedicated key, not your login password.** Generate one with
`ssh-keygen -t ed25519 -N '' -f ~/.ssh/book_deploy`, add the public half to
`~/.ssh/authorized_keys` on the host prefixed with `restrict`, and store the
private half base64-encoded so it stays a single line:

```
base64 -i ~/.ssh/book_deploy | tr -d '\n' | gh secret set SSH_KEY --repo you/your-book
```

Keys in `authorized_keys` are independent of your account password, so changing
that password never breaks publishing.

Get the host key with `ssh-keyscan example.edu` and check it against
`ssh-keygen -F example.edu -l` before you trust it. Host keys are public; it is
there so the upload refuses to talk to an impostor, not to keep a secret.

## Publishing to Firebase Hosting

```yaml
        with:
            deploy: firebase
            firebase-project: your-project
            verify-url: https://your-project.web.app/
        secrets:
            FIREBASE_SERVICE_ACCOUNT: ${{ secrets.FIREBASE_SERVICE_ACCOUNT }}
```

Don't run `firebase init hosting:github` to set this up. It writes workflows that
deploy `firebase.json`'s `public` directory without building it first — and since
that directory is gitignored, they publish an empty folder over your live book.

## Books with more than one edition

Point `manifest` at your editions file instead of a single spec:

```yaml
        with:
            manifest: editions.json
```

Every edition is built into one tree, each at its own base path, and each one is
checked separately before anything is published.

## Trying it without publishing

Both the `push` trigger and the **Run workflow** button are available, and the
button takes a `dry-run` option: it builds your book and reports what *would*
change without uploading anything. Do that first. It is also where a problem that
only shows up on Linux will surface — macOS filesystems ignore case, so a chapter
referencing `figure.png` when the file is `Figure.png` works at home and fails
here.

`reader-ref` builds your book against a different ref of this repository, which is
how to try a reader change against a real book before releasing it.

## Rebuilding every book after a reader change

A change here doesn't reach a published book until that book is rebuilt. If you
maintain several, [`rebuild-books.yml`](.github/workflows/rebuild-books.yml) is a
button that asks all of them to republish. Set two repository settings on your
fork or clone of this reader:

- a `BOOKS` variable listing them, as `owner/repo`, separated by spaces or commas
- a `BOOKS_DISPATCH_TOKEN` secret, a fine-grained token with **Actions: write** on
  each one

It is deliberately manual. A push here would otherwise redeploy every live site
at once, unwatched.

## A note on trust

The example above references this workflow at `@main`, which means your book
builds with whatever is on this repository's main branch at the time it runs. If
you are not the person who maintains this reader, pin it to a commit instead —
a reusable workflow runs with *your* repository's secrets:

```yaml
    uses: amyjko/bookish-reader/.github/workflows/publish-book.yml@<commit sha>
```

## Image size

Full-size figures are most of what a book weighs, and a multi-edition book pays
for each one per edition. The binder caps them at 1600px and re-encodes them.
To change that, add a `bookish.json` next to your `book.json`:

```json
{ "images": { "maxWidth": 1600, "palette": true, "quality": 82 } }
```

`maxWidth: 0` keeps your originals byte for byte. `palette` quantizes PNGs to 256
colours, which takes roughly 68% off a typical book against roughly 17% for a
plain re-encode — a large saving, but a visible one on photographs. Look at your
figures before leaving it on. `BOOKISH_IMAGE_MAX_WIDTH`, `BOOKISH_IMAGE_PALETTE`
and `BOOKISH_IMAGE_QUALITY` override these for a single run.
