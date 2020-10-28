import { Note, Scale, Chord, Interval } from "@tonaljs/tonal";

import Fretboard from './Fretboard'

import _ from 'underscore'
import * as Util from "./Util";

class FretboardApp {
	private _fretboard: Fretboard
	private _highlight: undefined|{fret:number,string:number}
	private _debouncedRedraw: () => void;

	constructor(fretboard: Fretboard) {
		this._fretboard = fretboard;
		this._debouncedRedraw = _.debounce(() => this.redraw('force'), 10, true);
	}

	public get highlight() { return this._highlight; }
	public set highlight(value) { this._highlight = value; this.redraw(); }

	public redraw(force: "force"|undefined = undefined) {
		if(!force) this._debouncedRedraw();
		else       this.draw(this._fretboard);
	}

	protected draw(fretboard: Fretboard) {
		fretboard.clear()
		fretboard.drawInlays()
		fretboard.drawFrets()
		fretboard.drawStrings()
		if(this.highlight) {
			fretboard.highlightFret(this.highlight.fret, this.highlight.string);
		}
	}

	protected click(note: {fret: number, string: number, note: string}) {}
}

class CheatSheetApp extends FretboardApp {
	get mode() { return (document.getElementById("ModeSelect") as HTMLSelectElement).value.toLowerCase() as "chord"|"scale"|"notes" }
	get noteCollectionName() { return (document.getElementById("ChordInput") as HTMLInputElement).value }
	get noteCollection() {
		const mode = this.mode;
		const noteCollectionName = this.noteCollectionName;
		return (
			(mode == "chord")? Chord.get(noteCollectionName) :
			(mode == "scale")? Scale.get(noteCollectionName) :
			(mode == "notes")? Util.parseNoteCollection(noteCollectionName) :
			null
		);
	}

	constructor(fretboard: Fretboard) {
		super(fretboard)
	}

	draw(fretboard: Fretboard) {
		super.draw(fretboard)

		const noteCollection = this.noteCollection;

		for (let index = 0; index < noteCollection.notes.length; index++) {
			const note     = noteCollection.notes[index];
			const interval = noteCollection.intervals[index];

			fretboard.drawNoteByName(note, Util.betterIntervalName(interval), Util.intervalStyle(interval));
		}
	}
}

function main() {
	let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width / 5;

	let fretboard = new Fretboard(canvas);

	let app = new CheatSheetApp(fretboard);

	app.redraw("force");

	let globals = {
		redraw: () => app.redraw(),
		setTuning: (tuning: string) => {
			(document.getElementById('StringsInput') as HTMLInputElement).value = tuning;
			(document.getElementById('StringsPresets') as HTMLSelectElement).value = '';
			fretboard.strings = Util.parseTuning(tuning);
			app.redraw();
		},
		setTheme: (theme: string) => {
			(document.getElementById('ThemeSelect') as HTMLSelectElement).value = theme;

			let themeClass = `theme-${theme}`;
			if(!document.body.classList.contains(themeClass)) {
				document.body.classList.remove('theme-Dark');
				document.body.classList.remove('theme-Light');
				document.body.classList.add(themeClass);
				app.redraw();
			}
		}
	};

	Object.assign(window as any, globals);

	globals.setTuning((document.getElementById('StringsInput') as HTMLInputElement).value);
	globals.setTheme((document.getElementById('ThemeSelect') as HTMLSelectElement).value);

	canvas.addEventListener('click', e => {
		let note = fretboard.pickNote(e.offsetX, e.offsetY);

		let modeSelect = document.getElementById("ModeSelect") as HTMLSelectElement;
		let chordInput = document.getElementById("ChordInput") as HTMLInputElement;

		if(modeSelect.value != "Notes") {
			modeSelect.value = "Notes";
			chordInput.value = '';
		}

		let notes = chordInput.value.split(' ').filter(v => v.trim().length);
		if(_.contains(notes, note)) {
			notes = notes.filter(n => n != note);
		}
		else {
			notes.push(note);
		}
		chordInput.value = notes.join(' ');
		app.redraw();
	});

	canvas.addEventListener('mousemove',
		e => {
			app.highlight = {
				fret: fretboard.pickFret(e.offsetX),
				string: fretboard.pickString(e.offsetY)
			}
		}
	);
	canvas.addEventListener('mouseleave', e => (app.highlight = null));

	/*
	let highlight = null;

	function getCurrentNoteCollection() {
		let mode =
		(document.getElementById("ModeSelect") as HTMLSelectElement)
		.value.toLowerCase() as "chord"|"scale"|"notes";
		let noteCollectionName = (document.getElementById("ChordInput") as HTMLInputElement).value;
		let noteCollection =
			(mode == "chord")? Chord.get(noteCollectionName) :
			(mode == "scale")? Scale.get(noteCollectionName) :
			(mode == "notes")? parseNoteCollection(noteCollectionName) : null;

		return noteCollection;
	}

	function redraw() {
		// Get required data
		let theme = (document.getElementById("ThemeSelect") as HTMLSelectElement).value;
		fretboard.colors = Fretboard.ColorThemes[theme];



		let noteCollection = getCurrentNoteCollection();
		fretboard.strings = parseTuning();

		// Draw
		fretboard.clear();

		if(highlight) {
			fretboard.highlightFret(highlight.fret, highlight.string);
		}

		fretboard.drawInlays();
		fretboard.drawFrets();
		fretboard.drawStrings();

		for(let string = 0; string < fretboard.strings.length; string++) {
			let note = fretboard.strings[string];
			for(let fret = 0; fret <= fretboard.numFrets; fret++) {
				const positionInChord = noteCollection.notes.findIndex(
					n => {
						const octaveN = Note.octave(n);
						const octaveNote = Note.octave(note);

						let octaveSameish = octaveN == null || octaveNote == null || octaveN == octaveNote;
						let chromaSameish = Note.chroma(n) == Note.chroma(note);

						return octaveSameish && chromaSameish;
					}
				);
				if(positionInChord >= 0) {
					let interval = noteCollection.intervals[positionInChord];

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
			if(highlight) {
				text.push(fretboard.getNote(highlight.string, highlight.fret));
			}
			text.push(noteCollection.notes.join(' '));
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

			if(mode == "scale") {
				let modes = Scale.modeNames(noteCollectionName).map(p => `${p[0]} ${p[1]}`);
				// let extended = Scale.extended(noteCollectionName).map(p => `${noteCollection.tonic} ${p}`);
				// let reduced  = Scale.reduced(noteCollectionName).map(p => `${noteCollection.tonic} ${p}`);

				let makeLink =
					(text: string, mode: "Scale"|"Chord") => [
						'<a onclick="',
						`document.getElementById('ModeSelect').value = '${mode}'; `,
						"document.getElementById('ChordInput').value = this.innerText.trim(); ",
						"redraw(); ",
						'"',
						">",
						text,
						"</a>"
					].join('');

				let indices = [0, 2, 4, 6];
				let seventhChords =
					modes
					.map(Scale.get)
					.map(scale => `${Chord.detect(indices.map(i => scale.notes[i]))[0]}`);

				text.push("Chords: " + seventhChords.map(c => makeLink(c, 'Chord')).join(', '));
				text.push("Modes: "  + modes.map(m => makeLink(m, 'Scale')).join(', '));
				// text.push("Extended Scales: " + extended.map(makeLink).join(', '));
				// text.push("Reduced Scales: "  + reduced.map(makeLink).join(', '));
			}
		}

		info.innerHTML = text.join('\n<br>\n');
	}
	updateInfo();
	*/
	document.getElementById('SaveButton').addEventListener('click', e => {
		let strings = (document.getElementById('StringsInput') as HTMLInputElement).value;
		let type    = (document.getElementById('ModeSelect')   as HTMLSelectElement).value;
		let name    = (document.getElementById('ChordInput')   as HTMLInputElement).value;

		fretboard.saveAsImage(`${type}-${name.replace(' ', '')}-${strings}.png`);
	});
}

(window as any).main = main;
