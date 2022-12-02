<template lang="pug">
fretboard(
	v-if="state.mode != 'settings'"
	:tuning="state.tuning"
	:minFret="+state.startFret"
	:maxFret="+state.endFret"
	:notes="notes"
	@hovered="hovered = $event"
	@drawn="toggle($event)"
)
a.flat-button(@click="selected = []") Clear
//- a.flat-button(@click="state.notes.oneNotePerString = !state.notes.oneNotePerString") One note per string: {{state.notes.oneNotePerString? 'Yes':'No'}}
span.big(v-if="looksLikeChordsHtml" v-html="looksLikeChordsHtml")
</template>

<style lang="scss">
.flat-button {
	cursor: pointer;
	padding: 1em;
	display: inline-block;
	color: #DDD;
	background: #444;
	&:hover { background: #555; }
	transition: background 100ms;
	margin-right: 1em;
}
.chordname {
	background: #222;
	border-radius: .3em;
	padding-inline: .2em;
	padding-block: .1em;
	color: white;
}
</style>

<script setup lang="ts">
import { computed, ref } from "vue";
import { detect } from '@tonaljs/chord-detect'
import { Note } from '@tonaljs/tonal'
import { parseTuning } from '../components/FretboardNotes'
import { oxfordCommaOr, remove } from "../util/Util";
import { uniq } from "lodash";
import { useState } from "@/state";
import type { FretboardPosition } from "@/components/FretboardTypes";

const state = useState();

const hovered = ref<FretboardPosition>();
const selected = state.notes.selected as any[];

function toggle(n: FretboardPosition) {
	if(!remove<any>(selected, x => x.fret == n.fret && x.string == n.string)) {
		if(state.notes.oneNotePerString)
			remove<any>(selected, x => x.string == n.string);
		selected.push(n);
	}
}

const notes = computed(() => {
	const result = selected.map(n => ({
		fret: n.fret,
		string: n.string,
		text: undefined as string|undefined, // n.note,
		color: '#250'
	}));

	const h = hovered.value;
	if(h) {
		result.push({
			fret: h.fret,
			string: h.string,
			text: h.note,
			color: selected.filter(n => n.string == h.string && n.fret == h.fret).length? '#BB0' : '#F00',
		});
	}
	return result;
});
const looksLikeChordsHtml = computed(() => {
	let pitches = selected.map(n => Note.pitchClass(n.note));
	if(pitches.length == 0) return;
	let chords = detect(uniq(pitches)).map(c => `<span class="chordname">${c}</span>`);
	if(chords.length == 0) return;
	return `This looks like a ${oxfordCommaOr(chords)} chord`;
});
const tuning = computed(() => parseTuning(state.tuning));

</script>
