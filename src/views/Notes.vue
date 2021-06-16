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

<script lang="ts">
import { computed, defineComponent, inject, onUnmounted, reactive, ref } from "vue";
import { detect } from '@tonaljs/chord-detect'
import { Note } from '@tonaljs/tonal'
import { parseTuning } from '../components/FretboardNotes'
import { remove, uniq } from "../util/Util";

function oxfordCommaOr(array: string[]) {
	if(array.length == 1)
		return array[0];

	let result = "";
	for(let i = 0; i < array.length; i++) {
		if(i == array.length - 1)
			result += ", or ";
		else if(i > 0)
			result += ", ";
		result += array[i];
	}
	return result;
}

export default defineComponent({
	setup(props) {
		let state = inject<any>('state');

		let data = reactive({
			state,
			hovered: null,
			highlight: null,
			selected: state.notes.selected as any[],
			toggle(n) {
				if(!remove<any>(data.selected, x => x.fret == n.fret && x.string == n.string)) {
					if(state.notes.oneNotePerString)
						remove<any>(data.selected, x => x.string == n.string);
					data.selected.push(n);
				}
			},
			notes: computed(() => {
				let result = data.selected.map(n => ({
					fret: n.fret,
					string: n.string,
					// text: n.note,
					color: '#250'
				}));

				if(data.hovered) {
					result.push({
						fret: data.hovered.fret,
						string: data.hovered.string,
						text: data.hovered.note,
						color: data.selected.filter(n => n.string == data.hovered.string && n.fret == data.hovered.fret).length? '#BB0' : '#F00',
					});
				}
				return result;
			}),
			looksLikeChordsHtml: computed(() => {
				let pitches = data.selected.map(n => Note.pitchClass(n.note));
				if(pitches.length == 0) return;
				let chords = detect(uniq(pitches)).map(c => `<span class="chordname">${c}</span>`);
				if(chords.length == 0) return;
				return `This looks like a ${oxfordCommaOr(chords)} chord`;
			}),
			tuning: computed(() => parseTuning(state.tuning)),
		});
		return data;
	}
})
</script>
