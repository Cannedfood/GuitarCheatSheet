<template lang="pug">
nav
	h1
		a(
			v-for="m in ['scales', 'arpeggios', 'settings']"
			:class="{active: state.mode == m }"
			@click="state.mode = m"
		) {{m.charAt(0).toUpperCase() + m.slice(1)}}
	.rest
		a.not-fullscreen(@click="enterFullscreen()") Fullscreen
		a.if-fullscreen(@click="exitFullscreen()") Exit Fullscreen
fretboard(
	v-if="state.mode != 'settings'"
	:tuning="state.tuning"
	:minFret="+state.startFret"
	:maxFret="+state.endFret"
	:notes="notes"
)

.arpeggios(v-if="state.mode == 'arpeggios'")
	div.big
		label.b Base Chord
		input.serif(type="string" v-model="state.arpeggio" @keydown.tab.prevent="state.arpeggio = didYouMean[0]")
		span.tiny.secondary(v-if="didYouMean.length")
			span Press TAB to autocomplete:
			a.mx-1(href="#" v-for="v in didYouMean" @click="state.scale = v") {{v}}
	library(:entries="lib.chords" v-model="state.arpeggio")

.scales(v-if="state.mode == 'scales'")
	div.big
		label.b Scale
		input.serif(type="string" v-model="state.scale" @keydown.tab.prevent="state.scale = didYouMean[0]")
		span.tiny.secondary(v-if="didYouMean.length")
			span Press TAB to autocomplete:
			a.mx-1(href="#" v-for="v in didYouMean" @click="state.scale = v") {{v}}
	library(:entries="lib.scales" v-model="state.scale")

.settings(v-if="state.mode == 'settings'")
	.row.big
		label.w-2 End Fret
		input(type="number" min="0" max="24" default="12" v-model="state.endFret")
	.row.big
		label.w-2 Start Fret
		input(type="number" min="0" max="24" default="0" v-model="state.startFret")
	.row.big
		label.w-2 Tuning
		input(type="string" v-model="state.tuning")
	.big Tuning presets:
	library(:entries="lib.tunings" v-model="state.tuning")

</template>

<script lang="ts">
import { computed, defineComponent, inject, reactive } from "vue";
import { scales, tunings, chords } from './util/Libraries'
import { labelNotesWithDegrees } from './util/MusicUtil'
import { Scale, Chord, ChordDictionary } from '@tonaljs/tonal'
import levenshtein from 'js-levenshtein'

export default defineComponent({
	setup(props) {
		let state = inject<any>("state");

		let notes = computed(() => {
			if(state.mode == "scales")
				return labelNotesWithDegrees(Scale.get(state.scale.trim().toLowerCase())) || [];
			else if(state.mode == "arpeggios")
				return labelNotesWithDegrees(Chord.get(state.arpeggio.trim().toLowerCase())) || [];
			else {
				if(state.mode != 'settings')
					console.log("Unsupported mode")
				return [];
			}
		});
		(window as any).Scale = Scale;
		(window as any).Chord = Chord;


		let didYouMean = computed(() => {
			function match(from: any, names: string[], name: string) {
				name = name.toLowerCase().trimLeft();

				let entry = from.get(name);
				if(entry && !entry.empty)
					return [];

				try {
					let [chroma, lookUp] = name.split(/ (.*)/);
					console.log(lookUp);
					return (
						names
						.map(n => ({
							dist: levenshtein(n, lookUp),
							value: n
						}))
						.sort((a, b) => a.dist - b.dist)
						.map(v => v.value)
						.slice(0, 3)
						.map(n => `${chroma} ${n}`)
						.map(n => n.replace(/\b\w/g, letter => letter.toUpperCase()))
					)
				}
				catch(e) {
					console.log(e);
					return []
				}
			}

			return (
				state.mode == "scales"? match(Scale, Scale.names(), state.scale) :
				state.mode == "arpeggios"? match(Chord, ChordDictionary.names(), state.arpeggio) :
				[]
			);
		})

		return reactive({
			state,
			notes,
			didYouMean,
			lib: { scales, tunings, chords },
			mode: "scales",
			enterFullscreen() {
				document.documentElement.requestFullscreen();
				// TODO: screen orientation
			},
			exitFullScreen() {
				document.exitFullscreen()
			},
		});
	}
})
</script>

<style lang="scss">
nav {
	display: flex;
	flex-flow: nowrap row;
	align-items: stretch;

	a {
		cursor: pointer;
		&:hover {
			background: #0002;
		}
	}

	h1 {
		display: flex;
		flex-flow: nowrap row;
		margin: 0;
		&>* {
			padding-top: .5em;
			cursor: pointer;

			margin: 0;
			padding: .7em;
			&:not(.active) {
				color: #AAA;
			}

			&:hover {
				background: #0002;
			}
		}
	}

	.rest {
		flex-grow: 1;
		display: flex;
		flex-flow: nowrap row;
		justify-content: flex-end;

		height: 100%;
		padding-right: 1em;
	}
}
</style>
