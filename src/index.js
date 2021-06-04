import * as Vue from 'vue'

import App from './App.vue'
import Fretboard from './components/Fretboard.vue'
import Library from './components/Library.vue'

import persistentState from './util/PersistentState'

let state = persistentState("state-v2", {
	startFret: 0,
	endFret: 14,
	tuning: "E2 A2 D3 G3 B3 E4",
	scale: "C Major",
	arpeggio: "CMaj7",
	mode: 'scales',
}, { versionPattern: /^state-v*/ });

Vue
.createApp(App)
.provide('state', state)
.component('fretboard', Fretboard)
.component('library', Library)
.mount('#app')
