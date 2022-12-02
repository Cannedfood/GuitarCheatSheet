import './index.scss';

import * as Vue from 'vue'

import App from './App.vue'
import Fretboard from './components/Fretboard.vue'
import Library from './components/Library.vue'

import { ChordDictionary } from '@tonaljs/tonal'

ChordDictionary.add(["P1", "M3", "7M"], ["maj7no5"], "Major7 no 5")
ChordDictionary.add(["P1", "m3", "7m"], ["min7no5"], "Minor7 no 5")
ChordDictionary.add(["P1", "M3", "7M", "9M"], ["maj9no5"], "Major9 no 5")
ChordDictionary.add(["P1", "m3", "7m", "9M"], ["maj9no5"], "Minor9 no 5")

import router from './routes'
import state from './state'

Vue
.createApp(App)
.use(router)
.provide('state', state)
.component('fretboard', Fretboard)
.component('library', Library)
.mount('#app')
