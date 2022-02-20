#!/bin/bash -e

rm *.html *.css *.js || true
rm -r dist .parcel-cache || true

npx parcel build src/index.html --public-url ./ --no-scope-hoist || true
npx parcel build src/index.html --public-url ./ --no-scope-hoist

cp dist/*.html dist/*.css dist/*.js .
git add *.js *.html *.css
