<template lang="pug">
nav
	h1
		router-link(v-for="m in ['scales', 'arpeggios', 'notes', 'practice', 'settings']" :to="`/${m}`") {{m.charAt(0).toUpperCase() + m.slice(1)}}
	.rest
		a.not-fullscreen(@click="enterFullscreen()") Fullscreen
		a.if-fullscreen(@click="exitFullscreen()") Exit Fullscreen

router-view

</template>

<script lang="ts">
import { defineComponent, inject, reactive } from "vue";

export default defineComponent({
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
		text-decoration: none;
		cursor: pointer;
		color: black;
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
			&:not(.router-link-active) {
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
