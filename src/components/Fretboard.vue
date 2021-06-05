<template lang="pug">
svg(ref="fretboard"
	:viewBox="`0 0 ${width} ${height}`"
	@mousemove="mousemove($event)"
	@mouseleave="mouseleave($event)"
	@mouseup="mouseup($event)"
	@mousedown="mousedown($event)"
	style="user-select: none;"
)
	//- Draw fretboard
	rect(width="100%" height="100%" :fill="colors.bg")
	path(:d="strings" :stroke="colors.string" vector-effect="non-scaling-stroke")
	path(:d="frets" :stroke="colors.fret" vector-effect="non-scaling-stroke")
	circle(v-for="c in fretMarkers" :cx="c.cx" :cy="c.cy" :r="c.r")

	//- Notes and stuff
	g(v-for="n in notes")
		circle(
			:cx="n.x" :cy="n.y" :r="n.r"
			:stroke="n.stroke" :fill="n.fill"
			vector-effect="non-scaling-stroke")
		text(
			:x="n.x" :y="n.y"
			:font-size="`${n.fontSize}`"
			:fill="n.textColor"
			text-anchor="middle"
			dominant-baseline="central"
		) {{n.text}}
</template>

<script lang="ts">
import { computed, defineComponent, defineEmit, PropType, reactive, ref } from "vue";
import { findNoteOnFretboard } from './FretboardNotes'
import { generate } from '../util/Util'
import { parseTuning } from '../util/MusicUtil'
import { Note } from '@tonaljs/tonal'

type Note = string | {
	note: string,
	fret?: number,
	string?: number,
	color?: string,
	text?: string,
}

export default defineComponent({
	props: {
		tuning: { default: "EADGBE" },
		notes:  { default: [..."CDE"], type: Array as PropType<Note[]> },
		minFret: { default: 0,   type: Number },
		maxFret: { default: 12,  type: Number },
		width:   { default: 100, type: Number },
		height:  { default: 24,  type: Number},
	},
	emits: [ 'clicked', 'hovered', 'drawn' ],
	setup(props, { emit }) {
		const colors = reactive({
			bg: "#333",
			string: "#111",
			fret: "#222",
			fretmarker: "#000"
		});

		const tuning = computed<string[]>(() => {
			if(typeof(props.tuning) == 'string')
				return parseTuning(props.tuning);
			return tuning;
		})

		const stringHeight = computed(() => props.height / tuning.value.length);
		function stringPosition(str: number) { return props.height - stringHeight.value * (str + .5); }
		function positionToString(y: number) { return Math.floor((props.height - y) / stringHeight.value); }

		function log(base: number, value: number) {
			return Math.log2(value) / Math.log2(base);
		}

		let linear = false;
		function fretboardPos(fret: number) { //< Computes the position on the fretboard (with scale length = 1)
			if(linear) return fret;
			const f = 0.94387431268; // Scaling factor from fret to fret, 2^(-1/12)
			return 1 - Math.pow(f, fret);
		}
		function invFretboardPos(x: number) {
			if(linear) return x;
			const f = 0.94387431268;
			return log(f, 1 - x);
		}
		function fretPosition(fret: number) {
			let min = fretboardPos(props.minFret);
			let max = fretboardPos(props.maxFret);
			let fac = max - min;
			let leftPadding = props.minFret <= 0? stringHeight.value*.4 : 0;

			let x = (fretboardPos(fret) - min) / fac;
			return x*(props.width - leftPadding) + leftPadding;
		}
		function frettingPosition(fret: number) {
			if(fret <= 0)
				return fretPosition(fret);
			else
				return (fretPosition(fret - 1) + fretPosition(fret)) * .5;
		}
		function positionToFret(x: number) {
			let min = fretboardPos(props.minFret);
			let max = fretboardPos(props.maxFret);
			let fac = max - min;
			let leftPadding = props.minFret <= 0? stringHeight.value*.4 : 0;

			let x1 = (x - leftPadding) / (props.width - leftPadding);
			let x2 = x1 * fac + min;

			let fret = invFretboardPos(x2);
			if(fret < .3)
				return 0;
			else
				return Math.ceil(fret);
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
					stroke: 'black',
					textColor: 'white',
					r: stringHeight.value * .4,
					x: frettingPosition(fret),
					y: stringPosition(string),
				});
			}

			for(let n of props.notes) {
				if(!n) continue;

				if(typeof n == 'object' && n.fret !== undefined && n.string !== undefined) {
					note(n.fret, n.string, n.color || "red", n.text);
				}
				else {
					let name = typeof n == 'string'? n : n.note;
					for(let position of findNoteOnFretboard(tuning.value, props.minFret, props.maxFret, name)) {
						if(typeof n == 'string')
							note(position.fret, position.string, "red", position.note);
						else
							note(position.fret, position.string, n.color || "red", n.text || position.note);
					}
				}

			}

			return result;
		});

		let fretboard = ref<SVGElement>(null);
		function position(e: MouseEvent) {
			let s = fretboard.value.getBoundingClientRect();
			let x = (e.pageX - s.x) / s.width * props.width;
			let y = (e.pageY - s.y) / s.height * props.height;
			let fret   = positionToFret(x);
			let string = positionToString(y);

			let note = Note.fromMidiSharps(Note.midi(tuning.value[string]) + fret)

			return { x, y, fret, string, note };
		}

		let lastDrawn = null;
		function mousemove(e: MouseEvent) {
			let p = position(e);
			emit('hovered', p);
			if(lastDrawn && (p.fret !== lastDrawn.fret || p.string != lastDrawn.string)) {
				emit("drawn", p);
				lastDrawn = p;
			}
		}
		function mousedown(e: MouseEvent) {
			let p = position(e);
			emit('clicked', p);

			lastDrawn = p;
			emit('drawn', p);
		}
		function mouseup(e: MouseEvent) {
			lastDrawn = null;
		}
		function mouseleave(e: MouseEvent) {
			emit('hovered', null);
			lastDrawn = null;
		}

		return {
			strings, frets, fretMarkers, colors, notes,
			mouseup, mousedown, mousemove, mouseleave, fretboard
		};
	}
})
</script>

<style lang="scss">

</style>
