import { Note, Scale, Chord } from "@tonaljs/tonal"

import Fretboard from './Fretboard'

function main() {
	let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width / 5;

	let fretboard = new Fretboard(canvas);

	let highlight = null;

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
			.value.toLowerCase() as "chord"|"scale";
		let noteCollectionName = (document.getElementById("ChordInput") as HTMLInputElement).value;
		let noteCollection = (mode == "chord")? Chord.get(noteCollectionName) : Scale.get(noteCollectionName);

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

	(window as any).redraw = redraw;

	canvas.addEventListener('mousemove', e => {
		highlight = {
			fret: fretboard.pickFret(e.offsetX),
			string: fretboard.pickString(e.offsetY)
		};
		redraw();
	});
	canvas.addEventListener('mouseleave', e => {
		highlight = null;
		redraw();
	});

	document.getElementById('SaveButton').addEventListener('click', e => {
		let strings = (document.getElementById('StringsInput') as HTMLInputElement).value;
		let type    = (document.getElementById('ModeSelect')   as HTMLSelectElement).value;
		let name    = (document.getElementById('ChordInput')   as HTMLInputElement).value;

		fretboard.saveAsImage(`${type}-${name.replace(' ', '')}-${strings}.png`);
	});
}

(window as any).main = main;
