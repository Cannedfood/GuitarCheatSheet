import { Interval } from '@tonaljs/tonal'

export
function intervalLongName(originalName: string) {
	const intervalNameMapping = {
		'1P': 'root',
		'2m': 'minor-second', '2M': 'major-second',
		'3m': 'minor-third', '3M': 'major-third',
		'4P': 'fourth', '4A': 'augmented-fourth',
		'5d': 'flat-five', '5P': 'fifth',
		'6m': 'minor-sixth', '6M': 'major-sixth',
		'7m': 'minor-seventh',
		'7M': 'major-seventh',
	} as { [key: string]: string };
	return intervalNameMapping[originalName] ?? originalName;
}

export
function intervalShortName(originalName: string) {
	const intervalNameMapping = {
		'1P': 'R',
		'2m': '2', '2M': '2',
		'3m': '3', '3M': '3',
		'4P': '4', '4A': '4#',
		'5d': '5b', '5P': '5',
		'6m': '6', '6M': '6',
		'7m': '7',
		'7M': '7',
	} as { [key: string]: string };
	return intervalNameMapping[originalName] ?? originalName;
}

export
function labelNotesWithDegrees(noteCollection?: { notes: string[] }) {
	if(!noteCollection) return [];

	const colors = {
		'R': "#F22",
		'4': "#353",
		'5': "#338",
		'7': "#808",
	} as { [key: string]: string };

	const intervals = noteCollection.notes.map(n => Interval.distance(noteCollection.notes[0], n));

	return noteCollection.notes.map((note, index) => {
		let name = intervalShortName(intervals[index]);
		return {
			note: note,
			text: name,
			color: colors[name] ?? '#222'
		}
	});
}
