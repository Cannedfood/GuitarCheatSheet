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
</template>

<script lang="ts">
import { computed, defineComponent, inject, onUnmounted, reactive, watch, watchEffect } from "vue";
import { parseTuning } from "../components/FretboardNotes";
import { delay } from "../util/Async";
import { fallback, sample, shuffle } from '../util/Util'

const randomModes = [
	['shuffle', 'Shuffle', 'Go through all entries before a note is repeated'],
	['random', 'Random', '100% random'],
	// ['progressive', 'Progressive', 'Learn efficiently and step-by-step'],
]

export default defineComponent({
	setup() {
		let state = inject<any>('state')
		let data = reactive({
			state,
			randomModes,
			tuning: computed(() => parseTuning(state.tuning)),
			lastClick: null,
			hovered: null,
			note: {
				fret: 0,
				string: 0,
				text: undefined
			},
			range: computed(() => Object.assign(state.practice.range, { fill: '#FFF1' })),
			selectingRange: computed(() => {
				if(!data.lastClick) return null;
				if(!data.hovered) return null;

				return {
					fret: Math.min(data.lastClick.fret, data.hovered.fret),
					endFret: Math.max(data.lastClick.fret, data.hovered.fret),
					string: Math.min(data.lastClick.string, data.hovered.string),
					endString: Math.max(data.lastClick.string, data.hovered.string),
				};
			}),
			clicked(position) {
				if(!data.lastClick) {
					data.lastClick = position;
				}
				else {
					state.practice.range = data.selectingRange;
					data.lastClick = null;
				}
			}
		});

		let running = true;
		async function run() {
			type Position = { fret: number, string: number };

			let allOptions = [] as Position[];
			let remainingOptions = [] as Position[];
			let introducedOptions = [] as Position[];
			watch([state.practice.range, state.practice.randomMode],
				() => {
					allOptions = [];
					remainingOptions = [];
					introducedOptions = [];

					let sstart = fallback(state.practice.range.string, 0);
					let send   = fallback(state.practice.range.endString, state.practice.range.string, data.tuning.length - 1);
					let fstart = fallback(state.practice.range.fret, state.startFret);
					let fend   = fallback(state.practice.range.endFret, state.practice.range.fret, state.endFret);

					for(let string = sstart; string <= send; string++)
						for(let fret = fstart; fret <= fend; fret++)
							allOptions.push({ string, fret });
				},
				{ deep: true }
			);

			while(running) {
				let next;
				if(state.practice.randomMode == "shuffle") {
					if(remainingOptions.length == 0)
						remainingOptions = shuffle([...allOptions]);

					next = remainingOptions.pop()
				}
				else if(state.practice.randomMode == "random") {
					next = sample(allOptions);
				}



				data.note.string = next.string;
				data.note.fret = next.fret;
				data.note.text = "?";
				await delay(state.practice.delay);
				data.note.text = undefined;
				await delay(state.practice.delay)
			}
		}
		run();

		onUnmounted(() => running = false)

		return data;
	}
})
</script>

<style lang="scss">

</style>
