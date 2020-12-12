import { Note } from "@tonaljs/tonal";

export interface FretboardPosition {
	string: number;
	fret: number;
	note?: string;
}

export class Fretboard {
	public static ColorThemes = {
		Light: {
			frets: "#555",
			backgroundHighlight: "rgb(0,0,0,.2)",
			strings: "#000",
			inlay: "#444",
			noteColors: {
				"default": { fill: '#000', text: '#FFF', border: null },
				"R":       { fill: '#F22' },
				"3":       { fill: '#000' },
				"4":       { fill: '#353' },
				"5":       { fill: '#338' },
				"7":       { fill: '#808' },
			},
		},
		Dark: {
			frets: "#555",
			backgroundHighlight: "rgb(255,255,255,.2)",
			strings: "#FFF",
			inlay: "#888",
			noteColors: {
				"default": { fill: '#FFF', text: '#000', border: null },
				"R":       { fill: '#F22', text: '#FFF' },
			},
		}
	}

	canvas: HTMLCanvasElement;
	graphics: CanvasRenderingContext2D;

	width: number;
	height: number;

	strings  = ['A', 'E', 'A', 'D', 'G', 'B', 'E'];
	minFret  = 0;
	numFrets = 12;

	colors = Fretboard.ColorThemes.Light;

	public constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.reconfigureCanvas();
	}

	public reconfigureCanvas() {
		// Use more pixels for high-dpi devices
		var dpr = window.devicePixelRatio || 1;
		var rect = this.canvas.getBoundingClientRect();
		this.canvas.width  = rect.width * dpr;
		this.canvas.height = rect.height * dpr;

		this.graphics = this.canvas.getContext('2d');
		this.graphics.scale(dpr, dpr);

		this.width = rect.width;
		this.height = rect.height;
	}

	get dpx(): number { return Math.ceil(this.width  / 2000); }
	get dpy(): number { return Math.ceil(this.height / 200); }

	get stringHeight(): number { return this.height / this.strings.length; }
	get fretWidth():    number { return (this.width - this.left) / this.numFrets; }
	get fretOffset():   number { return this.fretWidth; }

	get left():   number { return this.width / (3 * this.numFrets + 2); }
	get right():  number { return this.width; }
	get top():    number { return 0; }
	get bottom(): number { return this.top + this.height; }

	public notePositions(note: string): FretboardPosition[] {
		let result = [] as FretboardPosition[];

		const octave = Note.octave(note);
		const chroma = Note.chroma(note);

		for(let string = 0; string < this.strings.length; string++) {
			let fretboardNote = this.strings[string];
			for(let fret = 0; fret <= this.numFrets; fret++) {
				const fretboardOctave = Note.octave(fretboardNote);

				const octaveSameish = ( octave == null || fretboardOctave == null || octave == fretboardOctave );
				const chromaSameish = ( chroma == Note.chroma(fretboardNote) );

				const isSame = octaveSameish && chromaSameish;

				if(isSame) {
					result.push({string, fret});
				}

				fretboardNote = Note.simplify(Note.transpose(fretboardNote, "m2"));
			}
		}

		return result;
	}

	fretPosition(fret: number): number { return this.left + Math.ceil(fret * this.fretWidth)}
	fretCenter  (fret: number): number {
		if(fret > 0)
			return this.left + Math.ceil((fret - .5) * this.fretWidth);
		else
			return this.left - 10;
	}
	stringCenter(string: number): number { return this.height - Math.ceil((string + .5) * this.stringHeight); }
	stringTop(string: number):    number { return this.height - Math.ceil((string +  1) * this.stringHeight); }
	stringBottom(string: number): number { return this.height - Math.ceil((string +  0) * this.stringHeight); }

	clear() {
		this.graphics.clearRect(0, 0, this.width, this.height);
	}

	drawFrets() {
		this.graphics.beginPath();
		this.graphics.lineWidth = 6 * this.dpx;
		this.graphics.strokeStyle = this.colors.frets;
		for(let i = 0; i < this.numFrets; i++) {
			let x = this.fretPosition(i);
			this.graphics.moveTo(x, 0);
			this.graphics.lineTo(x, this.height);
		}
		this.graphics.stroke();
	}

	highlightFret(fret: number, string?: number) {
		let y      = 0;
		let height = this.height;
		if(string !== undefined) {
			y = this.stringTop(string);
			height = this.stringHeight;
		}

		const x = this.fretPosition(fret);
		const width = this.fretWidth;

		this.graphics.fillStyle = this.colors.backgroundHighlight;
		this.graphics.fillRect(x - width, y, width, height);
	}

	highlightString(string: number) {
		const y = this.stringCenter(string);
		this.graphics.lineWidth = 3 * this.dpy;
		this.graphics.strokeStyle = 'red';
		this.graphics.beginPath();
		this.graphics.moveTo(0, y);
		this.graphics.lineTo(this.width, y);
		this.graphics.stroke();
	}

	drawStrings() {
		this.graphics.beginPath();
		this.graphics.lineWidth = 1 * this.dpy;
		this.graphics.strokeStyle = this.colors.strings;
		for(let i = 0; i < this.strings.length; i++) {
			let y = this.stringCenter(i);
			this.graphics.moveTo(0, y);
			this.graphics.lineTo(this.width, y);
		}
		this.graphics.stroke();
	}

	drawNoteByName(note: string, text?: string, style: string = "default") {
		for(let position of this.notePositions(note)) {
			this.drawNote(position.string, position.fret, text, style);
		}
	}

	drawNote(string: number, fret: number, text?: string, style: string = "default") {
		const defaultColors = this.colors.noteColors["default"];
		const noteColors = this.colors.noteColors[style] || this.colors.noteColors["default"];

		const fillColor   = noteColors.fill   || defaultColors.fill   || '#000';
		const textColor   = noteColors.text   || defaultColors.text   || '#FFF';
		const borderColor = noteColors.border || defaultColors.border || fillColor;

		const x = this.fretCenter(fret);
		const y = this.stringCenter(string);

		const radius = Math.ceil(this.stringHeight * .4);
		const fontSize = Math.ceil(radius);

		this.graphics.beginPath();
		this.graphics.lineWidth = 1;
		this.graphics.fillStyle = fillColor;
		this.graphics.strokeStyle = borderColor;
		this.graphics.arc(x, y, radius, 0, 2 * Math.PI);
		this.graphics.fill();
		this.graphics.stroke();

		if(text) {
			this.graphics.textAlign = "center";
			this.graphics.textBaseline = "middle";
			this.graphics.fillStyle = textColor;
			this.graphics.font = `${fontSize}px Arial`;
			this.graphics.fillText(text, x, y);
		}
	}

	drawInlays() {
		this.graphics.beginPath();

		const doubleDotted = [12, 24];
		const singleDotted = [3, 5, 7, 9, 15, 17, 19, 21, 24];

		const inlayRadius = Math.ceil(this.stringHeight / 5);

		// TODO: draw text

		for(let fret of doubleDotted) {
			if(fret > this.minFret + this.numFrets) continue;
			if(fret < this.minFret) continue;
			const x = this.fretCenter(fret);

			this.graphics.beginPath();
			this.graphics.arc(x, this.stringTop(0), inlayRadius, 0, Math.PI * 2);
			this.graphics.arc(x, this.stringBottom(this.strings.length - 1), inlayRadius, 0, Math.PI * 2);
			this.graphics.fillStyle = this.colors.inlay;
			this.graphics.fill();
		}

		for(let fret of singleDotted) {
			if(fret > this.minFret + this.numFrets) continue;
			if(fret < this.minFret) continue;
			const x = this.fretCenter(fret);
			let   y: number;
			if((this.strings.length % 2) == 0)
				y = this.stringBottom(this.strings.length / 2);
			else
				y = this.stringTop(0);

			this.graphics.beginPath();
			this.graphics.arc(x, y, inlayRadius, 0, Math.PI * 2);
			this.graphics.fillStyle = this.colors.inlay;
			this.graphics.fill();
		}
	}

	drawFretNumbers() {
		this.graphics.textAlign = "left";
		this.graphics.textBaseline = "bottom";
		this.graphics.font = `${this.stringHeight * .2}px Arial`
		this.graphics.fillStyle = 'gray';
		for (let i = 0; i <= this.numFrets; i++) {
			this.graphics.fillText(
				`${i + this.minFret}`,
				this.fretCenter(i + this.minFret),
				this.bottom
			)
		}
	}

	pickString(y: number): number {
		return Math.floor((this.height - y) / this.stringHeight);
	}

	pickFret(x: number) {
		return Math.floor((x - this.fretPosition(0)) / this.fretWidth) + 1;
	}

	pickNote(x: number, y: number): string {
		return this.getNote(this.pickString(y), this.pickFret(x));
	}

	getNote(string: number, fret: number) {
		let note   = this.strings[string];
		let octave = Note.octave(note);

		if(!octave)
			note += '4';

		let result = Note.fromMidi(
			Note.midi(note) + fret
		);

		if(!octave)
			result = Note.pitchClass(result);

		return result;
	}

	saveAsImage(filename: string = "Fretboard.png") {
		const image = this.canvas.toDataURL("image/png", 1).replace('image/png', 'image/octet-stream');

		let dlLink = document.createElement('a');
		dlLink.setAttribute('href', image);
		dlLink.setAttribute('download', filename);
		dlLink.click();
	}
};
