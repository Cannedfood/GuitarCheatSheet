<template lang="pug">
svg(:viewBox="`0 0 ${width} ${height}`")
	//- Draw fretboard
	rect(width="100%" height="100%" :fill="colors.bg")
	path(:d="strings" :stroke="colors.string" vector-effect="non-scaling-stroke")
	path(:d="frets" :stroke="colors.fret" vector-effect="non-scaling-stroke")
	circle(v-for="c in fretMarkers" :cx="c.cx" :cy="c.cy" :r="c.r")

	//- Notes and stuff
	circle(v-for="n in notes"
		:cx="n.x" :cy="n.y" :r="n.r"
		:stroke="n.stroke" :fill="n.fill"
		vector-effect="non-scaling-stroke")
	text(v-for="n in notes"
		:x="n.x" :y="n.y"
		:font-size="`${n.fontSize}`"
		text-anchor="middle"
		dominant-baseline="central"
	) {{n.text}}
</template>

<script lang="ts">
import { computed, defineComponent, PropType, reactive } from "vue";
import { findNoteOnFretboard } from './FretboardNotes'
import { generate } from '../util/Util'
import { parseTuning } from '../util/MusicUtil'

type Note = string | { note: string }

export default defineComponent({
	props: {
		tuning: { default: "EADGBE" },
		notes:  { default: [..."CDE"], type: Array as PropType<Note[]> },
		minFret: { default: 0,   type: Number },
		maxFret: { default: 12,  type: Number },
		width:   { default: 100, type: Number },
		height:  { default: 24,  type: Number},
	},
	emits: [ 'clicked', 'hovered' ],
	setup(props, { emit }) {
		const colors = reactive({
			bg: "#333",
			string: "#111",
			fret: "#222",
			fretmarker: "#000"
		});

		const tuning = computed(() => {
			if(typeof(props.tuning) == 'string')
				return parseTuning(props.tuning);
			return tuning;
		})

		const stringHeight = computed(() => props.height / tuning.value.length);
		function stringPosition(str: number) { return props.height - stringHeight.value * (str + .5); }

		function fretPosition(fret: number) {
			function fretboardPos(fret: number) { //< Computes the position on the fretboard (with scale length = 1)
				const f = 0.94387431268; // Scaling factor from fret to fret, 2^(-1/12)
				return 1 - Math.pow(f, fret);
			}
			let min = fretboardPos(props.minFret);
			let max = fretboardPos(props.maxFret);
			let fac = max - min;
			let x = (fretboardPos(fret) - min) / fac;
			return props.width*x;
		}
		function frettingPosition(fret: number) {
			if(fret <= 0)
				return fretPosition(fret);
			else
				return (fretPosition(fret - 1) + fretPosition(fret)) * .5;
		}

		const strings = computed(() =>
			generate(stringPosition, tuning.value.length)
			.map(y=>`M 0 ${y} H ${props.width}`)
			.join(' ')
		);

		const frets = computed(() =>
			generate(fretPosition, props.minFret, props.maxFret)
			.map(x=>`M ${x} 0 V ${props.height}`)
			.join(' ')
		);

		const fretMarkers = computed(() => {
			let result = [];
			function marker(fret: number, str: number, atTheBottom = false) {
				if(props.minFret > fret) return;
				if(props.maxFret < fret) return;
				result.push({
					cx: frettingPosition(fret),
					cy: stringPosition(atTheBottom? tuning.value.length - (1 + str) : str),
					r: props.height / 30
				});
			}
			[3, 5, 7, 9].forEach(f => marker(f, 0.5));
			marker(12, 0.5);
			marker(12, 1.5);
			[15,17,19, 21].forEach(f => marker(f, 0.5, true));
			marker(24, 0.5, true);
			marker(24, 1.5, true);
			marker(24, 2.5, true);
			return result;
		});

		const notes = computed(() => {
			let result = [];
			function note(fret: number, string: number, color: string, text?: string) {
				result.push({
					text,
					fontSize: stringHeight.value * .4 / Math.max(1, text.length - 2),
					fill: color,
					stroke: "black",
					r: stringHeight.value * .4,
					x: frettingPosition(fret),
					y: stringPosition(string),
				});
			}

			for(let n of props.notes) {
				let name = typeof n == 'string'? n : n.note;
				for(let position of findNoteOnFretboard(tuning.value, props.minFret, props.maxFret, name)) {
					note(position.fret, position.string, "red", position.note);
				}
			}

			return result;
		});

		return { strings, frets, fretMarkers, colors, notes };
	}
})
</script>

<style lang="scss">

</style>
