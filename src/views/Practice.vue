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
</template>

<script lang="ts">
import { computed, defineComponent, inject, onUnmounted, reactive, watch, watchEffect } from "vue";
import { delay } from "../util/Async";
import { shuffle } from '../util/Util'

export default defineComponent({
	setup() {
		let state = inject<any>('state')
		let data = reactive({
			state,
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
			let allOptions = [] as { fret: number, string: number }[];
			let remainingOptions: typeof allOptions;
			watchEffect(() => {
				allOptions = [];
				for(let string = state.practice.range.string; string <= state.practice.range.endString; string++)
					for(let fret = state.practice.range.fret; fret <= state.practice.range.endFret; fret++)
						allOptions.push({ string, fret });
				remainingOptions = shuffle([ ...allOptions ]);
			});

			while(running) {
				if(remainingOptions.length == 0)
					remainingOptions = shuffle([...allOptions]);

				let next = remainingOptions.pop()

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
