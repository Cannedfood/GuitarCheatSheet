<template lang="pug">
nav
	h1
		a(
			v-for="m in ['scales', 'arpeggios', 'settings']"
			:class="{active: mode == m }"
			@click="mode = m"
		) {{m.charAt(0).toUpperCase() + m.slice(1)}}
	.rest
		a.not-fullscreen(@click="enterFullscreen()") Fullscreen
		a.if-fullscreen(@click="exitFullscreen()") Exit Fullscreen
fretboard(
	v-if="mode != 'settings'"
	:tuning="settings.tuning"
	:minFret="+settings.startFret"
	:maxFret="+settings.endFret"
)

.arpeggios(v-if="mode == 'arpeggios'")
	div.big
		label.b Base Chord
		input.serif(type="string" v-model="settings.scale")
	library(:entries="lib.chords" v-model="settings.scale")

.scales(v-if="mode == 'scales'")
	div.big
		label.b Scale
		input.serif(type="string" v-model="settings.scale")
	library(:entries="lib.scales" v-model="settings.scale")

.settings(v-if="mode == 'settings'")
	.row.big
		label.w-2 End Fret
		input(type="number" min="0" max="24" default="12" v-model="settings.endFret")
	.row.big
		label.w-2 Start Fret
		input(type="number" min="0" max="24" default="0" v-model="settings.startFret")
	.row.big
		label.w-2 Tuning
		input(type="string" v-model="settings.tuning")
	library(:entries="lib.tunings" v-model="settings.tuning")

</template>

<script lang="ts">
import { defineComponent, inject, reactive } from "vue";
import { scales, tunings, chords } from './util/Libraries'

export default defineComponent({
	setup(props) {
		let settings = inject("settings");

		return reactive({
			settings,
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
