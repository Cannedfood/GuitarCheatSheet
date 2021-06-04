import { Note } from '@tonaljs/tonal'

interface FretNote {
	note: string;
	fret: number;
	string: number;
}

export function findNoteOnFretboard(tuning: string[], minFret: number, maxFret: number, note: string): FretNote[] {
	let result = [] as FretNote[];

	const noteChroma = Note.chroma(note);
	const noteOctave = Note.octave(note);

	for(let str = 0; str < tuning.length; str++) {
		const strChroma = Note.chroma(tuning[str]);
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
