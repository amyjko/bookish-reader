#!/bin/zsh
# Clean up prior build
rm -r build
# Get into this repo
cd bookish-reader
# Install dependencies
npm install
# Run the bind script on the book in the parent directory
npm run bind ../book.json
# Copy the build into the book's directory
cp -r build ../build