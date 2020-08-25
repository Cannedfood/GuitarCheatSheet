# Guitar Cheat Sheet

A one-html-file tool that visualizes scales and arpeggios on the guitar fretboard.

# How to use

Try it out here: https://cannedfood.github.io/GuitarCheatSheet/

You can also download the html file, it has no dependencies and works offline.

# Features

- [x] Chords/Arpeggions
- [x] Scales
- [x] Customizable Tunings
- [ ] Custom Notes
- [x] Save as PNG

# Development

## Used Libraries

- Compilation/Bundling
  - [parcel-bundler](https://parceljs.org/): No-Configuration bundler
  - [parcel-plugin-inliner](https://github.com/shff/parcel-plugin-inliner#readme): Makes the output html standalone)
- Music Theory
  - [tonaljs](https://github.com/tonaljs/tonal)

## Building and running
- `npm run watch`: Start a local webserver that updates the site when you save
- `npm run build`: Compiles the app into the `dist/` folder and copies the output to `index.html`

