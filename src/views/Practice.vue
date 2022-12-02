
<script setup lang="ts">
import { computed, onMounted, onUnmounted, reactive, ref, watchEffect } from "vue";
import { isSharpOrFlat, parseTuning } from "../components/FretboardNotes";
import { delay } from "../util/Async";
import { useState } from '../state'
import type { FretboardPosition, NoteDescription } from "@/components/FretboardTypes";
import { shuffle, sample } from "lodash";

const randomModes = [
	['shuffle', 'Shuffle', 'Go through all entries before a note is repeated'],
	['random', 'Random', '100% random'],
	// ['progressive', 'Progressive', 'Learn efficiently and step-by-step'],
]

const state = useState();

const tuning = computed(() => parseTuning(state.tuning));

const hovered = ref<FretboardPosition>();
const note = reactive<NoteDescription>({
	note: "",
	fret: 0,
	string: 0,
	text: undefined,
});

const lastClick = ref<FretboardPosition>();

const range = computed(() => Object.assign(state.practice.range, { fill: '#FFF1' }));

const selectingRange = computed(() => {
	if(!lastClick.value) return null;
	if(!hovered.value) return null;

	return {
		fret: Math.min(lastClick.value.fret, hovered.value.fret),
		endFret: Math.max(lastClick.value.fret, hovered.value.fret),
		string: Math.min(lastClick.value.string, hovered.value.string),
		endString: Math.max(lastClick.value.string, hovered.value.string),
	};
});

function clicked(position: FretboardPosition) {
	if(!lastClick.value) {
		lastClick.value = position;
	}
	else {
		state.practice.range = selectingRange.value!;
		lastClick.value = undefined;
	}
}

let running = true;
async function run() {
	type Position = { fret: number, string: number };

	let allOptions = [] as Position[];
	let remainingOptions = [] as Position[];
	watchEffect(() => {
		allOptions = [];
		remainingOptions = [];

		const sstart = state.practice.range.string    ?? 0;
		const send   = state.practice.range.endString ?? state.practice.range.string ?? tuning.value.length - 1;
		const fstart = state.practice.range.fret      ?? state.startFret;
		const fend   = state.practice.range.endFret   ?? state.practice.range.fret ?? state.endFret;

		for(let string = sstart; string <= send; string++)
			for(let fret = fstart; fret <= fend; fret++)
				allOptions.push({ string, fret });

		if(state.practice.onlyWholeNotes) {
			allOptions = allOptions.filter(o => !isSharpOrFlat(tuning.value, o.string, o.fret))
		}
	});

	function takeNextNote() {
		switch(state.practice.randomMode) {
			case 'shuffle':
				if(remainingOptions.length == 0)
					remainingOptions = shuffle(allOptions);
				return remainingOptions.pop();
			case 'random':
				return sample(allOptions);
			default:
				throw new Error('Unknown random mode: ' + state.practice.randomMode);
		}
	}

	while(running) {
		const next = takeNextNote();

		if(next) {
			note.string = next.string;
			note.fret = next.fret;
			note.text = "?";
			await delay(state.practice.delay);
			note.text = undefined;
		}
		await delay(state.practice.delay)
	}
}

onMounted(() => { running = true; run() });
onUnmounted(() => running = false)

</script>

<template lang="pug">
fretboard(
	:tuning="state.tuning"
	:minFret="+state.startFret"
	:maxFret="+state.endFret"
	:notes="[ note ]"
	:highlights="[ hovered, selectingRange, range ]"
	@hovered="hovered = $event"
	@clicked="clicked($event)"
)
.row
	label Delay
	input.w-2.right(type="number" v-model="state.practice.delay")
	span ms
h3.secondary Click Fretboard to Select Range

h5 ...or
select(@change="state.practice.range = { string: +$event.target.value }; $event.target.value = ''")
	option(disabled,selected,value="") Practice string
	option(v-for="i in tuning.length" :value="i - 1") {{i}} - {{tuning[i - 1]}}
button(@click="state.practice.range = { fret: 0 }") Practice open strings

h5 Random Mode:
.radio(v-for="entry of randomModes")
	input(type="radio" name="randomization-mode" :id="entry[0]" :value="entry[0]" v-model="state.practice.randomMode")
	label(:for="entry[0]")
		span {{entry[1]}}
		span.secondary  - {{entry[2]}}
label
	input(type="checkbox" v-model="state.practice.onlyWholeNotes")
	span Only Whole Notes
</template>
