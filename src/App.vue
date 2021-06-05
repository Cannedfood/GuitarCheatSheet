<template lang="pug">
nav
	h1
		a(
			v-for="m in ['scales', 'arpeggios', 'notes', 'settings']"
			:class="{active: state.mode == m }"
			@click="state.mode = m"
		) {{m.charAt(0).toUpperCase() + m.slice(1)}}
	.rest
		a.not-fullscreen(@click="enterFullscreen()") Fullscreen
		a.if-fullscreen(@click="exitFullscreen()") Exit Fullscreen

arpeggios(v-if="state.mode == 'arpeggios'")
scales(v-if="state.mode == 'scales'")
notes(v-if="state.mode == 'notes'")
settings(v-if="state.mode == 'settings'")

</template>

<script lang="ts">
import { defineComponent, inject, reactive } from "vue";

import Settings  from './views/Settings.vue'
import Notes     from './views/Notes.vue'
import Arpeggios from './views/Arpeggios.vue'
import Scales    from './views/Scales.vue'

export default defineComponent({
	components: { Settings, Notes, Arpeggios, Scales },
	setup(props) {
		let state = inject<any>("state");
		return reactive({
			state,
			enterFullscreen() {
				document.documentElement.requestFullscreen();
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
