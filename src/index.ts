import { Note, Scale, Chord, Interval } from "@tonaljs/tonal"

import Fretboard from './Fretboard'

import _ from 'underscore'

function main() {
	let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width / 5;

	let fretboard = new Fretboard(canvas);

	let highlight = null;

	function parseNoteCollection(s: string) {
		let notes = s.split(' ');
		let intervals = []

		let root = Note.get(notes[0]);
		for(let note of notes) {
			intervals.push(Interval.distance(root, note));
		}

		return { notes, intervals };
	}

	function redraw() {
		let theme = (document.getElementById("ThemeSelect") as HTMLSelectElement).value;
		fretboard.colors = Fretboard.ColorThemes[theme];

		let themeClass = `theme-${theme}`;
		if(!document.body.classList.contains(themeClass)) {
			document.body.classList.remove('theme-Dark');
			document.body.classList.remove('theme-Light');
			document.body.classList.add(themeClass);
		}

		fretboard.clear();

		let mode =
			(document.getElementById("ModeSelect") as HTMLSelectElement)
			.value.toLowerCase() as "chord"|"scale"|"notes";
		let noteCollectionName = (document.getElementById("ChordInput") as HTMLInputElement).value;
		let noteCollection =
			(mode == "chord")? Chord.get(noteCollectionName) :
			(mode == "scale")? Scale.get(noteCollectionName) :
			(mode == "notes")? {} : null;

		fretboard.strings = [...(document.getElementById("StringsInput") as HTMLInputElement).value]

		if(highlight) {
			fretboard.highlightFret(highlight.fret, highlight.string);
		}

		fretboard.drawInlays();
		fretboard.drawFrets();
		fretboard.drawStrings();

		for(let string = 0; string < fretboard.strings.length; string++) {
			let note = fretboard.strings[string];
			for(let fret = 0; fret <= fretboard.numFrets; fret++) {
				const positionInChord = noteCollection.notes.findIndex(n => (Note.pitchClass(n) == Note.pitchClass(note)));
				if(positionInChord >= 0) {
					let interval = noteCollection.intervals[positionInChord];

					const intervalNameMapping = {
						'1P': 'R',
						'2m': '2', '2M': '2',
						'3m': '3', '3M': '3',
						'4P': '4',
						'5d': '5', '5P': '5',
						'6m': '6', '6M': '6',
						'7m': '7',
						'7M': '7',
					};

					let name = intervalNameMapping[interval] || interval;
					fretboard.drawNote(
						string, fret,
						name,
						name
					);
				}
				note = Note.simplify(Note.transpose(note, "m2"));
			}
		}
	}
	redraw();

	(window as any).redraw = () => {
		redraw();
		updateInfo();
	};

	function updateInfo() {
		let info = document.getElementById('info');

		let mode =
			(document.getElementById("ModeSelect") as HTMLSelectElement)
			.value.toLowerCase() as "chord"|"scale";
		let noteCollectionName = (document.getElementById("ChordInput") as HTMLInputElement).value;
		let noteCollection = (mode == "chord")? Chord.get(noteCollectionName) : Scale.get(noteCollectionName);

		let text = [];
		if(noteCollection) {
			text.push(
				noteCollection.notes.join(' ')
			);
			text.push(
				noteCollection.intervals
				.filter(v => v != '1P')
				.map(v =>
					v.endsWith('M')? v.substr(0, 1) :
					v.endsWith('m')? `<small>${v.substr(0, 1)}</small>` :
					v.endsWith('P')? v.substr(0, 1) :
					v.endsWith('A')? `${v.substr(0, 1)}<sup>+</sup>`:
					v.endsWith('d')? `${v.substr(0, 1)}<sup>o</sup>`:
					v
				)
				.join('')
			);
		}
		if(highlight) {
			text.push(fretboard.getNote(highlight.string, highlight.fret));
		}

		info.innerHTML = text.join(', ');
	}
	updateInfo();

	let setHighlight = (newHighlight) => {
		if(!_.isEqual(newHighlight, highlight)) {
			highlight = newHighlight;
			updateInfo();
			redraw();
		}
	};

	canvas.addEventListener('mousemove',
		e => setHighlight({
			fret: fretboard.pickFret(e.offsetX),
			string: fretboard.pickString(e.offsetY)
		})
	);
	canvas.addEventListener('mouseleave', e => setHighlight(null));

	document.getElementById('SaveButton').addEventListener('click', e => {
		let strings = (document.getElementById('StringsInput') as HTMLInputElement).value;
		let type    = (document.getElementById('ModeSelect')   as HTMLSelectElement).value;
		let name    = (document.getElementById('ChordInput')   as HTMLInputElement).value;

		fretboard.saveAsImage(`${type}-${name.replace(' ', '')}-${strings}.png`);
	});
}

(window as any).main = main;
