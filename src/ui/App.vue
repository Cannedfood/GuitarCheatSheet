<template lang="pug">
.app
	top-bar(v-model="mode" v-bind:options="appModes")

	input(type=text v-model="tuning")
	preset-selector(v-model="tuning" v-bind:presets="tuningPresets")

	chord-mode(v-if="mode == 'Chord Helper'" v-model="highlightNotes")
	scale-mode(v-if="mode == 'Scale Helper'" v-model="highlightNotes")

	fretboard(v-bind:highlights="highlightNotes" v-bind:strings="strings")
</template>

<script>
import { Chord } from '@tonaljs/tonal'
import _ from 'underscore'

import PresetSelector from './components/PresetSelector'
import TopBar from './components/TopBar'
import Fretboard from './components/Fretboard'
import ChordMode from './modes/ChordMode'
import ScaleMode from './modes/ScaleMode'

import * as Util from '../util/Util'
import * as SaveState from '../util/SaveState'

export default {
	components: { TopBar, Fretboard, ChordMode, ScaleMode, PresetSelector },
	data: function() {
		return {
			mode:   "",
			chord:  "C major",
			tuning: "B1 E2 A2 D3 G3 B3 E4",
			highlightNotes: Util.toHighlights(Chord.get("C major"))
		};
	},
	watch: {
		mode(mode) { document.title = mode }
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
		},
		appModes() {
			return [
				"Chord Helper",
				"Scale Helper",
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
