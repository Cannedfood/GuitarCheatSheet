import { Interval } from '@tonaljs/tonal'

export
function parseTuning(text) {
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

export
function intervalLongName(originalName) {
	const intervalNameMapping = {
		'1P': 'root',
		'2m': 'minor-second', '2M': 'major-second',
		'3m': 'minor-third', '3M': 'major-third',
		'4P': 'fourth', '4A': 'augmented-fourth',
		'5d': 'flat-five', '5P': 'fifth',
		'6m': 'minor-sixth', '6M': 'major-sixth',
		'7m': 'minor-seventh',
		'7M': 'major-seventh',
	};
	return intervalNameMapping[originalName] || originalName;
}

export
function intervalShortName(originalName) {
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
function toHighlights(noteCollection) {
	if(!noteCollection || !noteCollection.notes) return [];

	let intervals = noteCollection;

	if(intervals == null) {
		intervals = noteCollection.notes.map(n => Interval.distance(noteCollection.notes[0], n));
	}

	return noteCollection.notes.map((note, index) => {
		return {
			note:  note,
			class: intervalLongName(noteCollection.intervals[index]),
			text:  intervalShortName(noteCollection.intervals[index])
		}
	});
}
