<template lang="pug">
.app
	h1 Hello {{this.mode}}

	input(type=text v-model="tuning")
	preset-selector(v-model="tuning" v-bind:presets="tuningPresets")

	select(v-model="mode")
		option(selected) Scale
		option Chord

	chord-mode(v-if="mode == 'Chord'" v-model="highlightNotes")
	scale-mode(v-if="mode == 'Scale'" v-model="highlightNotes")

	fretboard(v-bind:highlights="highlightNotes" v-bind:strings="strings")
</template>

<script>
import { Chord } from '@tonaljs/tonal'
import _ from 'underscore'

import PresetSelector from './PresetSelector'
import Fretboard from './Fretboard'
import ChordMode from './ChordMode'
import ScaleMode from './ScaleMode'

import * as Util from '../util/Util'
import * as SaveState from '../util/SaveState'

export default {
	components: { Fretboard, ChordMode, ScaleMode, PresetSelector },
	data: function() {
		return {
			mode:   "",
			chord:  "C major",
			tuning: "B1 E2 A2 D3 G3 B3 E4",
			highlightNotes: Util.toHighlights(Chord.get("C major"))
		};
	},
	computed: {
		strings() {
			return Util.parseTuning(this.tuning);
		},
		tuningPresets() {
			return [
				{ group: "Guitar",   name: "E Standard", value: "E2 A2 D3 G3 B3 E4" },
				{ group: "Guitar",   name: "Drop D",     value: "D2 A2 D3 G3 B3 E4" },
				{ group: "7-String", name: "B Standard", value: "B1 E2 A2 D3 G3 B3 E4" },
				{ group: "7-String", name: "Drop A",     value: "A1 E2 A2 D3 G3 B3 E4" },
				{ group: "Bass",     name: "E Standard", value: "E1 A1 D2 G2" },
				{ group: "5-String", name: "B Standard", value: "B0 E1 A1 D2 G2" },
				{ group: "5-String", name: "Drop A",     value: "A0 E1 A1 D2 G2" },
			]
		}
	},
	methods: {
		saveState() {
			SaveState.save("appState", {
				mode: this.mode,
				chord: this.chord,
				tuning: this.tuning,
			});
		},
		loadState() {
			SaveState.apply("appState", this);
		}
	},
	updated() { this.saveState(); },
	created() { this.loadState(); },
}
</script>

<style>

</style>
