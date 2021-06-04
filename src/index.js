import * as Vue from 'vue'

import App from './App.vue'
import Fretboard from './components/Fretboard.vue'
import Library from './components/Library.vue'

let settings = Vue.reactive({
	startFret: 0,
	endFret: 14,
	tuning: "E2 A2 D3 G3 B3 E4",
})

Vue
.createApp(App)
.provide('settings', settings)
.component('fretboard', Fretboard)
.component('library', Library)
.mount('#app')
