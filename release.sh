#!/bin/sh -e

PORT="5000"

rm -r dist .parcel-cache || true
npx parcel build  src/index.html || true
npx parcel build src/index.html

npx serve -l "${PORT}" dist/ &
echo hi

sleep 0.3

npx inliner "http://localhost:${PORT}" > index.html

for x in $(jobs -p); do kill $x; done;

wait
clear

git reset
git add ./index.html
git commit -m "Release"
