<template lang="pug">
.chord-settings
	input(type=text v-model="chord")
	preset-selector(v-model="chord" v-bind:presets="presets")
</template>

<script>
import * as SaveState from '../util/SaveState'
import * as Util from '../util/Util'
import { Chord } from '@tonaljs/tonal'

import PresetSelector from './PresetSelector'

export default {
	components: { PresetSelector },
	data: function() {
		return { chord: "C major" }
	},
	watch: {
		chord(val, oldval) {
			this.$emit('input', Util.toHighlights(Chord.get(val)));
		}
	},
	methods: {
		saveState() { SaveState.save("ChordModeState", { chord: this.chord }); },
		loadState() { SaveState.apply("ChordModeState", this); },
	},
	computed: {
		presets() {
			return [
				{ group: "Triads", name: "C Major",      value: "C major" },
				{ group: "Triads", name: "C Minor",      value: "C minor" },
				{ group: "Triads", name: "C Diminished", value: "C dim" },
				{ group: "Triads", name: "C Augmented",  value: "C aug" },
				{ group: "Triads", name: "C Quartal/Sus4/Sus2",  value: "C quartal" },

				{ group: "Seventh", name: "C Major 7",    value: "Cmaj7" },
				{ group: "Seventh", name: "C Minor 7",    value: "Cmaj7" },
				{ group: "Seventh", name: "C Dominant 7", value: "Cdom" },
				{ group: "Seventh", name: "C Minor maj7", value: "CmMaj7" },
			];
		}
	},
	updated() { this.saveState(); },
	created() { this.loadState(); },
}
</script>

<style>

</style>
