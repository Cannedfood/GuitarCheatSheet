<template lang="pug">
fretboard(
	:tuning="state.tuning"
	:minFret="+state.startFret"
	:maxFret="+state.endFret"
	:notes="notes"
)
div.big
	label.b Base Chord
	input.serif(type="string" v-model="state.arpeggio" @keydown.tab.prevent="state.arpeggio = didYouMean[0]")
	span.tiny.secondary(v-if="didYouMean.length")
		span Press TAB to autocomplete:
		a.mx-1(href="#" v-for="v in didYouMean" @click="state.scale = v") {{v}}
library(:entries="chords" v-model="state.arpeggio")
</template>

<script lang="ts">
import { computed, defineComponent, inject, reactive } from "vue";
import { Chord, ChordDictionary } from '@tonaljs/tonal'
import { labelNotesWithDegrees } from '../util/Names'
import fuzzyMatch from '../util/FuzzyMatch'
import { chords } from '../util/Presets'
import { flatten, titleCase, uniq } from "../util/Util";

let chordNames = uniq(flatten(
	ChordDictionary.names().map(name => [name, ...ChordDictionary.get(name).aliases]))
);

export default defineComponent({
	setup(props) {
		let state = inject<any>('state');
		let data = reactive({
			state,
			notes: computed(() => labelNotesWithDegrees(
				Chord.get(state.arpeggio.trim().toLowerCase()) ||
				Chord.get(state.arpeggio.trim())
			)),
			didYouMean: computed(() => {
				if(data.notes.length > 0) return [];

				let [success, chroma, lookUp] = state.arpeggio.match(/^([A-Ga-g][b,#]?)\s*(.+)$/);
				if(!success) return [];

				return fuzzyMatch(chordNames, lookUp, 5).map(result => titleCase(`${chroma} ${result}`))
				// console.log(ChordDictionary.names());

				// return fuzzyMatch(ChordDictionary.names(), state.arpeggio)
				// 	.map(n => titleCase(`${chroma} ${n}`));
			}),
			chords
		});
		return data;
	}
})
</script>

<style lang="scss">

</style>
