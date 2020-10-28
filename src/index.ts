import { Scale, Chord } from "@tonaljs/tonal";

import { Fretboard, FretboardPosition } from './Fretboard'

import _ from 'underscore'
import * as Util from "./Util";

class FretboardApp {
	private _fretboard: Fretboard
	private _highlight: undefined|{fret:number,string:number}
	private _debouncedRedraw: () => void;

	constructor(fretboard: Fretboard) {
		this._fretboard = fretboard;
		this._debouncedRedraw = _.debounce(() => this.redraw('force'), 10, true);
		this.redraw();
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
			fretboard.highlightString(this.highlight.string);
		}
	}

	public click(position: FretboardPosition) {}
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

	public click(position: FretboardPosition) {
		let modeSelect = document.getElementById("ModeSelect") as HTMLSelectElement;
		let chordInput = document.getElementById("ChordInput") as HTMLInputElement;

		if(modeSelect.value != "Notes") {
			modeSelect.value = "Notes";
			chordInput.value = '';
		}

		let notes = chordInput.value.split(' ').filter(v => v.trim().length);
		if(_.contains(notes, position.note))
			notes = notes.filter(n => n != position.note);
		else
			notes.push(position.note);
		chordInput.value = notes.join(' ');
		this.redraw();
	}
}

function main() {
	let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width / 5;

	let fretboard = new Fretboard(canvas);
	let app = new CheatSheetApp(fretboard);

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
		const string = fretboard.pickString(e.offsetY);
		const fret = fretboard.pickFret(e.offsetX);
		const note = fretboard.getNote(string, fret);

		app.click({string, fret, note});
	});

	canvas.addEventListener('mousemove',
		e => {
			app.highlight = {
				fret: fretboard.pickFret(e.offsetX),
				string: fretboard.pickString(e.offsetY)
			}
		}
	);
	canvas.addEventListener('mouseleave', () => (app.highlight = null));
	
	document.getElementById('SaveButton').addEventListener('click', () => {
		let strings = (document.getElementById('StringsInput') as HTMLInputElement).value;
		let type    = (document.getElementById('ModeSelect')   as HTMLSelectElement).value;
		let name    = (document.getElementById('ChordInput')   as HTMLInputElement).value;

		fretboard.saveAsImage(`${type}-${name.replace(' ', '')}-${strings}.png`);
	});
}

(window as any).main = main;
