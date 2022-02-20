#!/bin/bash

rm -r dist .parcel-cache || true
npx parcel build  src/index.html --public-url ./ || true
npx parcel build src/index.html --public-url ./

rm ./*.html ./*.css ./*.js
cp dist/*.html dist/*.css dist/*.js .
git add ./*.js ./*.html ./*.css
