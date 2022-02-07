<template lang="pug">
fretboard(
	:tuning="state.tuning"
	:minFret="+state.startFret"
	:maxFret="+state.endFret"
	:notes="notes"
)
div.big
	label.b Scale
	input.serif(type="string" v-model="state.scale" @keydown.tab.prevent="state.scale = didYouMean[0]")
	span.tiny.secondary(v-if="didYouMean.length")
		span Press TAB to autocomplete:
		a.mx-1(href="#" v-for="v in didYouMean" @click.prevent.stop="state.scale = v") {{v}}
library(:entries="scales" v-model="state.scale")
</template>

<script lang="ts">
import { Scale } from "@tonaljs/tonal";
import { computed, defineComponent, inject, reactive } from "vue";
import fuzzyMatch from "../util/FuzzyMatch";
import { labelNotesWithDegrees } from "../util/Names";
import { scales } from '../util/Presets'
import { titleCase } from "../util/Util";

export default defineComponent({
	setup() {
		let state = inject<any>('state');
		let data = reactive({
			state,
			notes: computed(() => labelNotesWithDegrees(Scale.get(state.scale.trim().toLowerCase()))),
			didYouMean: computed(() => {
				try {
					if(data.notes.length > 0) return [];

					let [success, chroma, scale] = state.scale.match(/^([A-Ga-g][b,#]?)\s*(.+)$/);
					if(!success) return [];
	
					return (
						fuzzyMatch(Scale.names(), scale, 3)
						.map(n => titleCase(`${chroma} ${n}`))
					)
				}
				catch(e) {
					console.error(e);
					return [];
				}
			}),
			scales
		});
		return data;
	}
})
</script>

<style lang="scss">

</style>
