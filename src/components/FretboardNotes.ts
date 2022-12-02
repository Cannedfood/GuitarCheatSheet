import { Note } from '@tonaljs/tonal'

interface FretNote {
	note: string;
	fret: number;
	string: number;
}

export
function parseTuning(text: string) {
	let tuning = [];
	for(let char of [...text]) {
		if(char.trim().length == 0)
			continue;
		if(char == '#' || char == 'b' || !isNaN(+char))
			tuning[tuning.length - 1] += char;
		else
			tuning.push(char);
	}
	return tuning;
}

export function findNoteOnFretboard(tuning: string[], minFret: number, maxFret: number, note: string): FretNote[] {
	let result = [] as FretNote[];

	const noteChroma = Note.chroma(note)!;
	const noteOctave = Note.octave(note);

	for(let str = 0; str < tuning.length; str++) {
		const strChroma = Note.chroma(tuning[str])!;
		const strOctave = Note.octave(tuning[str]);

		const minFretChroma = (strChroma + minFret) % 12;
		const minFretOctave = strOctave === undefined? undefined : (strOctave + Math.floor(minFret / 12));


		let octave = minFretOctave;
		let fret = minFret - minFretChroma + noteChroma;
		if(fret < minFret) {
			fret += 12;
			if(octave !== undefined)
				octave += 1;
		}
		while(fret <= maxFret) {
			if(noteOctave === octave || noteOctave === undefined || octave === undefined) {
				let noteName: string;
				if(octave === undefined)
					noteName = Note.pitchClass(Note.fromMidiSharps(noteChroma))
				else
					noteName = Note.fromMidiSharps(noteChroma + 12*octave);

				result.push({
					note: noteName,
					string: str,
					fret
				});
			}
			fret += 12;
			if(octave !== undefined)
				octave += 1;
		}
	}

	return result;
}

export
function noteAt(tuning: string[], string: number, fret: number) {
	return Note.fromMidiSharps(Note.midi(tuning[string])! + fret);
}

export
function isSharpOrFlat(tuning: string[], string: number, fret: number) {
	return Note.accidentals(noteAt(tuning, string, fret))
}

const fretPositionFactor = Math.pow(2, -1/12); // Factor from fret position to fret position

function log(base: number, value: number) { return Math.log2(value) / Math.log2(base); }

export
function fretboardPos(fret: number, linear = false) { //< Computes the position on the fretboard (with scale length = 1)
	if(linear) return fret;
	return 1 - Math.pow(fretPositionFactor, fret);
}
export
function invFretboardPos(x: number, linear = false) {
	if(linear) return x;
	return log(fretPositionFactor, 1 - x);
}
