import persistentState from './util/PersistentState'

const state = persistentState("state-v100", {
	lastPath: '/scales',
	startFret: 0,
	endFret: 14,
	tuning: "E2 A2 D3 G3 B3 E4",
	scale: "C Major",
	arpeggio: "CMaj7",
	notes: {
		selected: []
	},
	practice: {
		range: { string: 0, endString: 0, fret: 0, endFret: 12 },
		delay: 1000,
		randomMode: 'shuffle'
	},
}, { versionPattern: /^state-v/ });

export default state;

export type State = typeof state;
