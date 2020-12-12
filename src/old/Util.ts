import { Note, Interval } from '@tonaljs/tonal'

export
function parseNoteCollection(s: string) {
	let notes = s.split(' ');
	let intervals = []

	let root = Note.get(notes[0]);
	for(let note of notes) {
		let i = Interval.simplify(
			Interval.fromSemitones(Interval.semitones(Interval.distance(root, note)))
		);
		if(i == '8P') i = '1P';
		intervals.push(i);
	}

	return { notes, intervals };
}

export
function parseTuning(text: string) {
	let tuning = [] as string[];
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

export
function betterIntervalName(originalName: string) {
	const intervalNameMapping = {
		'1P': 'R',
		'2m': '2', '2M': '2',
		'3m': '3', '3M': '3',
		'4P': '4', '4A': '4#',
		'5d': '5b', '5P': '5',
		'6m': '6', '6M': '6',
		'7m': '7',
		'7M': '7',
	};
	return intervalNameMapping[originalName] || originalName;
}

export
function wholeNoteIndices(startNote: string, halfSteps: number) {
	let result = [] as number[];

	let note = startNote;
	for (let i = 0; i < halfSteps; i++) {
		if(!Note.get(note).acc) {
			result.push(i);
		}
		note = Note.simplify(Note.transpose(note, 'm2'));
	}

	return result;
}

export
function intervalStyle(originalName: string) {
	return betterIntervalName(originalName);
}
