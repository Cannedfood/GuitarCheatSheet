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
		a.mx-1(href="#" v-for="v in didYouMean" @click.prevent.stop="state.arpeggio = v") {{v}}
library(:entries="chords" v-model="state.arpeggio")
</template>

<script lang="ts">
import { computed, defineComponent, reactive } from "vue";
import { Chord, ChordDictionary } from '@tonaljs/tonal'
import { labelNotesWithDegrees } from '../util/Names'
import fuzzyMatch from '../util/FuzzyMatch'
import { chords } from '../util/Presets'
import { titleCase } from "../util/Util";
import { uniq } from 'lodash'
import { useState } from "@/state";

let chordNames = uniq(ChordDictionary.names().flatMap(name => [name, ...ChordDictionary.get(name).aliases]));

export default defineComponent({
	setup(props) {
		let state = useState();
		let data = reactive({
			state,
			notes: computed(() => labelNotesWithDegrees(
				Chord.get(state.arpeggio.trim().toLowerCase()) ||
				Chord.get(state.arpeggio.trim())
			)),
			didYouMean: computed(() => {
				try {
					if(data.notes.length > 0) return [];
					if(!state.arpeggio || typeof(state.arpeggio) !== 'string' || !state.arpeggio.match)
						return [];
	
					const [success, chroma, lookUp] = state.arpeggio.toString().match(/^([A-Ga-g][b,#]?)\s*(.+)$/)!;
					if(!success) return [];
	
					return fuzzyMatch(chordNames, lookUp, 5).map(result => titleCase(`${chroma} ${result}`))
				}
				catch(e) {
					console.error(e);
					return [];
				}
			}),
			chords
		});
		return data;
	}
})
</script>

