#!/bin/sh -e

PORT="5000"

rm -r dist .parcel-cache || true
npx parcel build src/index.html --no-scope-hoist

npx serve -l "${PORT}" dist/ &
echo hi

sleep 0.3

npx inliner "http://localhost:${PORT}" > index.html

for x in $(jobs -p); do kill $x; done;

clear
