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
	circle(v-for="c in fretMarkers" :key="c.cx + c.cy * 100" :cx="c.cx" :cy="c.cy" :r="c.r")

	//- Draw highlights
	rect(
		v-for="b in highlightBoxes"
		:x="b.x" :y="b.y" :width="b.w" :height="b.h"
		:fill="b.fill" :stroke="b.stroke"
		rx="1" ry="1"
	)

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

<script setup lang="ts">
import { computed, reactive, ref } from "vue";
import type { ComputedRef, PropType } from 'vue'
import { findNoteOnFretboard, fretboardPos, invFretboardPos, noteAt, parseTuning } from './FretboardNotes'
import { generate } from '../util/Util'
import type { FretboardPosition, Highlight, Note } from "./FretboardTypes";
import * as Tonal from "@tonaljs/tonal";

const props = defineProps({
	tuning: { default: "EADGBE" },
	notes:  { default: [..."CDE"], type: Array as PropType<Note[]> },
	highlights: { default: [], type: Array as PropType<Highlight[]> },
	minFret: { default: 0,   type: Number },
	maxFret: { default: 12,  type: Number },
	width:   { default: 100, type: Number },
	height:  { default: 24,  type: Number},
});

const emit = defineEmits<{
	(e: 'clicked', pos: FretboardPosition): void,
	(e: 'hovered', pos: FretboardPosition|undefined): void,
	(e: 'drawn', pos: FretboardPosition): void,
}>();

const colors = reactive({
	bg: "#333",
	string: "#111",
	fret: "#222",
	fretmarker: "#000"
});

const tuning: ComputedRef<string[]> = computed<string[]>(() => {
	if(typeof(props.tuning) == 'string')
		return parseTuning(props.tuning);
	return props.tuning;
});

const stringHeight = computed(() => props.height / tuning.value.length);
function stringPosition(str: number) { return props.height - stringHeight.value * (str + .5); }
function positionToString(y: number) { return Math.floor((props.height - y) / stringHeight.value); }

function fretPosition(fret: number) {
	const min = fretboardPos(props.minFret);
	const max = fretboardPos(props.maxFret);
	const fac = max - min;
	const leftPadding = props.minFret <= 0? stringHeight.value*.4 : 0;

	const x = (fretboardPos(fret) - min) / fac;
	return x*(props.width - leftPadding) + leftPadding;
}
function frettingPosition(fret: number) {
	if(fret <= 0)
		return fretPosition(fret);
	else
		return (fretPosition(fret - 1) + fretPosition(fret)) * .5;
}
function positionToFret(x: number) {
	const min = fretboardPos(props.minFret);
	const max = fretboardPos(props.maxFret);
	const fac = max - min;
	const leftPadding = props.minFret <= 0? stringHeight.value*.4 : 0;

	const x1 = (x - leftPadding) / (props.width - leftPadding);
	const x2 = x1 * fac + min;

	const fret = invFretboardPos(x2);
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
	const result = [] as Array<{ cx: number, cy: number, r: number }>;
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
	const result = [] as Array<{
		text: string,
		fontSize: number,
		fill: string,
		stroke: string,
		textColor: string,
		r: number,
		x: number,
		y: number,
	}>;
	function note(fret: number, string: number, color: string, text?: string) {
		if(!text) text = Tonal.Note.pitchClass(noteAt(tuning.value, string, fret));
		result.push({
			text: text,
			fontSize: stringHeight.value * .4 / Math.max(1, text.length - 2),
			fill: color,
			stroke: 'black',
			textColor: 'white',
			r: stringHeight.value * .4,
			x: frettingPosition(fret),
			y: stringPosition(string),
		});
	}

	for(const n of props.notes) {
		if(!n) continue;

		if(typeof n == 'object' && n.fret !== undefined && n.string !== undefined) {
			note(n.fret, n.string, n.color || "red", n.text);
		}
		else {
			const name = typeof n == 'string'? n : n.note;
			for(const position of findNoteOnFretboard(tuning.value, props.minFret, props.maxFret, name)) {
				if(typeof n == 'string')
					note(position.fret, position.string, "red", position.note);
				else
					note(position.fret, position.string, n.color || "red", n.text || position.note);
			}
		}

	}

	return result;
});

const highlightBoxes = computed(() => {
	return props.highlights.filter(v=>v).map(hl => {
		const minFret = hl.fret ?? props.minFret;
		const maxFret = Math.max(.2, hl.endFret ?? hl.fret ?? props.maxFret);
		const minString = hl.string ?? 0;
		const maxString = hl.endString ?? hl.string ?? (props.tuning.length - 1);

		const x = fretPosition(minFret - 1);
		const w = fretPosition(maxFret) - x;
		const y = stringPosition(maxString + .5);
		const h = stringPosition(minString - .5) - y;

		const fill = hl.fill || "#FFF2";
		const stroke = hl.outline || "none";

		return { x, y, w, h, fill, stroke };
	})
})

const fretboard = ref<SVGElement>();
function position(e: MouseEvent): FretboardPosition|undefined {
	if(!fretboard.value)
		return undefined;

	const s = fretboard.value.getBoundingClientRect();

	const x = (e.clientX - s.left) / s.width * props.width;
	const y = (e.clientY - s.top) / s.height * props.height;
	const fret   = positionToFret(x);
	const string = positionToString(y);
	const note = noteAt(tuning.value, string, fret);

	return { x, y, fret, string, note };
}

let lastDrawn = undefined as FretboardPosition|undefined;
function mousemove(e: MouseEvent) {
	const p = position(e)!;

	emit('hovered', p);
	if(lastDrawn && (p.fret !== lastDrawn.fret || p.string != lastDrawn.string)) {
		emit("drawn", p);
		lastDrawn = p;
	}
}
function mousedown(e: MouseEvent) {
	const p = position(e)!;
	emit('clicked', p);

	lastDrawn = p;
	emit('drawn', p);
}
function mouseup(e: MouseEvent) {
	lastDrawn = undefined;
}
function mouseleave(e: MouseEvent) {
	emit('hovered', undefined);
	lastDrawn = undefined;
}
</script>
