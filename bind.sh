#!/bin/zsh
# Stop at the first failure. Without this, a bind that dies partway still
# runs the copy below and exits 0, so the caller publishes a half-built book.
set -e
# Run from inside the reader checkout (the caller, e.g. publish.sh, cd's here first).
# Clean up prior build
rm -rf ../build
# Install dependencies
npm install
# Bind the book in the parent directory. Defaults to ../book.json; pass a path
# (e.g. ../editions.json) as the first argument to build a multi-edition manifest.
npm run bind "${1:-../book.json}"
# Copy the build into the book's directory
cp -r build ../build
