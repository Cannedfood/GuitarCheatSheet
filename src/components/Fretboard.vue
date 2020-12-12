<template lang="pug">
.fretboard(v-bind:class="{ hasZeroFret }")
	.string(v-for="string in strings.slice().reverse()")
		.fret(v-for="fret in frets(string)")
			.fret-text(v-if="fret.text" v-bind:class="fret.class") {{fret.text}}
		.h-line
	.string
		.fret-number(v-for="i in numFrets") {{i + startFret - 1}}
</template>

<script>
import { Note } from '@tonaljs/tonal'
import _ from 'underscore'

export default {
	props: {
		startFret: { type: Number, default: 0 },
		numFrets: { type: Number, default: 15 },
		strings: { type: Array, default: () => "B1 E2 A2 D3 G3 B3 E4".split(' ') },
		highlights: { type: Array, default: () => [{ note: 'C', text: 'C', class: 'root' }] }
	},
	computed: {
		hasZeroFret() { return this.startFret == 0; }
	},
	methods: {
		frets(string) {
			let result = [];
			let note = Note.fromMidi(Note.midi(string) + this.startFret);
			for(let index = 0; index < this.numFrets; index++) {
				let fretNumber = index + this.startFret;
				result.push(Object.assign(
					{},
					this.noteProperties(string, fretNumber, note),
					{ number: fretNumber, note: note }
				));
				note = Note.simplify(Note.transpose(note, 'm2'));
			}
			return result
		},
		noteProperties(string, fret, note) {
			const n = Note.get(note);
			for(let highlight of this.highlights) {
				if(highlight.note) {
					const h = Note.get(highlight.note);
					if(n.chroma == h.chroma && (h.oct === undefined || n.oct == undefined || h.oct == n.oct)) {
						return highlight;
					}
				}
			}
			return {};
		}
	}
}
</script>

<style>
	.fretboard {
		--string-height: 3rem;
		--nobbin-size: calc(var(--string-height) * .85);
		--fret-width: 8rem;

		--fret-thickness: 5px;
		--nut-thickness: calc(var(--fret-thickness) * 1.5);
		--fret-color: gray;
		--string-thickness: 2px;
		--string-color: gray;
		--string-highlight: red;
	}

	.fretboard {
		background: transparent;
		display: flex;
		flex-direction: column;
		width: min-content;
	}
	.fretboard * { font: 1em Arial; }
	.string {
		position: relative;
		display: flex;
		flex-direction: row;
	}
	.string .h-line {
		position: absolute;
		top: calc(var(--string-height) / 2 - var(--string-thickness) / 2);
		left: 0;
		height: var(--string-thickness);
		width: 100%;
		background: var(--string-color);
	}
	.string:hover .h-line {
		background: var(--string-highlight);
	}
	.fret {
		box-sizing: border-box;
		border-right: var(--fret-thickness) solid var(--fret-color);
		height: var(--string-height);
		width: var(--fret-width);
		text-align: center;

		display: flex;
		justify-content: center;
		align-items: center;

		cursor: pointer;
	}
	.fret-number {
		width: var(--fret-width);
		text-align: center;
		color: dimgray;
		font-size: .5em;
	}
	.fretboard.hasZeroFret .fret:nth-of-type(1), .fretboard.hasZeroFret .fret-number:nth-of-type(1) {
		border-right-width: var(--nut-thickness);
		width: calc(var(--fret-width) / 2);
		justify-content: right;
	}
	.fret:hover {
		background-color: bisque;
	}

	.fret-text {
		display: inline-block;
		border-radius: calc(var(--nobbin-size) / 2);
		width:  var(--nobbin-size);
		height: var(--nobbin-size);

		display: flex;
		justify-content: center;
		align-items: center;
		z-index: 3;

		color: white;
		font-weight: bold;
	}

	.fret-text { background-color: black; }
	.fret-text.root   { background-color: #F22; }
	.fret-text.fourth { background-color: #353; }
	.fret-text.fifth  { background-color: #338; }
	.fret-text.seventh { background-color: #808; }
</style>
