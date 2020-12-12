<template lang="pug">
.scale-settings
	input(type=text v-model="scale")
	preset-selector(v-model="scale" v-bind:presets="presets")
</template>

<script>
import * as SaveState from '../../util/SaveState'
import * as Util from '../../util/Util'
import { Chord, Scale, ScaleDictionary } from '@tonaljs/tonal'

import PresetSelector from '../components/PresetSelector'

export default {
	components: { PresetSelector },
	data: function() {
		return {
			baseNote: "C",
			scale: "C major"
		}
	},
	watch: {
		scale(val, oldval) {
			this.$emit('input', Util.toHighlights(Scale.get(val)));
		}
	},
	methods: {
		saveState() { SaveState.save("ScaleModeState", { scale: this.scale }); },
		loadState() { SaveState.apply("ScaleModeState", this); },
	},
	computed: {
		presets() {
			return [
				{ group: "Diatonic", name: "C Lydian" },
				{ group: "Diatonic", name: "C Ionian (major)" },
				{ group: "Diatonic", name: "C Mixolydian" },
				{ group: "Diatonic", name: "C Dorian" },
				{ group: "Diatonic", name: "C Aeolian (minor)" },
				{ group: "Diatonic", name: "C Phrygian" },
				{ group: "Diatonic", name: "C Locrian" },
				{ group: "Harmonic", name: "C Harmonic Minor" },
				{ group: "Harmonic", name: "C Locrian #6" },
				{ group: "Harmonic", name: "C Ionian #5" },
				{ group: "Harmonic", name: "C Dorian #4" },
				{ group: "Harmonic", name: "C Phrygian Dominant" },
				{ group: "Harmonic", name: "C Lydian #2" },
				{ group: "Harmonic", name: "C Superlocrian" },
				{ group: "Melodic",  name: "C Melodic Minor" },
				{ group: "Melodic",  name: "C Dorian b2/Phrygian #6" },
				{ group: "Melodic",  name: "C Lydian augmented" },
				{ group: "Melodic",  name: "C Lydian dominant (overtone scale)" },
				{ group: "Melodic",  name: "C Mixolydian b6" },
				{ group: "Melodic",  name: "C Aeolian b5/Locrian #2" },
				{ group: "Melodic",  name: "C Altered/Superlocrian" },

				{ group: "Pentatonic", name: "C Pentatonic", value: "C pentatonic" }
			].map(v => ({
				group: v.group,
				name: v.name,
				value: v.value || v.name.toLowerCase().split(/[\(\,\/]/)[0].trim()
			}));
		}
	},
	updated() { this.saveState(); },
	created() { this.loadState(); },
}
</script>

<style>

</style>
