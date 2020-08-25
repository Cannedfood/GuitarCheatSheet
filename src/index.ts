import { Note, Interval, Scale, Chord } from "@tonaljs/tonal"

class Fretboard {
	canvas: HTMLCanvasElement;
	graphics: CanvasRenderingContext2D;

	width: number;
	height: number;

	strings  = ['A', 'E', 'A', 'D', 'G', 'B', 'E'];
	minFret  = 0;
	numFrets = 12;

	colors =
	/** /
	{
		frets: "#555",
		backgroundHighlight: "#888",
		strings: "#FFF",
		noteBorder: "#000",
		inlay: "#888",
		noteColors: {
			"default":    { fill: '#BBB', text: '#FFF' },
			"highlight1": { fill: '#FAA', text: '#FFF' },
			"highlight2": { fill: '#AFA', text: '#FFF' },
		},
	}
	/*/
	{
		frets: "#555",
		backgroundHighlight: "#CCC",
		strings: "#000",
		noteBorder: "#000",
		inlay: "#444",
		noteColors: {
			"default":    { fill: '#000', text: '#FFF', border: null },
			"highlight1": { fill: '#F22', text: '#FFF', border: null },
			"highlight2": { fill: '#2F2', text: '#FFF', border: null },
		},
	}
	/**/

	public constructor(canvas: HTMLCanvasElement) {
		this.canvas = canvas;
		this.graphics = canvas.getContext('2d');
		this.width = canvas.width;
		this.height = canvas.height;
	}

	get stringHeight(): number { return this.height / this.strings.length; }
	get fretWidth():    number { return (this.width - this.left) / this.numFrets; }
	get fretOffset():   number { return this.fretWidth; }

	get left():   number { return 50; }
	get right():  number { return this.width; }
	get top():    number { return 0; }
	get bottom(): number { return this.height; }

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
		this.graphics.lineWidth = 6;
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

		let x = this.fretPosition(fret);
		let width = this.fretWidth;

		this.graphics.fillStyle = this.colors.backgroundHighlight;
		this.graphics.fillRect(x, y, width, height);
	}

	drawStrings() {
		this.graphics.beginPath();
		this.graphics.lineWidth = 1;
		this.graphics.strokeStyle = this.colors.strings;
		for(let i = 0; i < this.strings.length; i++) {
			let y = this.stringCenter(i);
			this.graphics.moveTo(0, y);
			this.graphics.lineTo(this.width, y);
		}
		this.graphics.stroke();
	}

	drawNote(string: number, fret: number, text?: string, style: "default"|"highlight1"|"highlight2" = "default") {
		let fillColor = this.colors.noteColors[style].fill || '#000';
		let textColor = this.colors.noteColors[style].text || '#FFF';
		let borderColor = this.colors.noteColors[style].border || fillColor || '#000';

		let x = this.fretCenter(fret);
		let y = this.stringCenter(string);

		let radius = this.stringHeight * .5 - 5;

		this.graphics.beginPath();
		this.graphics.fillStyle = fillColor;
		this.graphics.strokeStyle = borderColor;
		this.graphics.arc(x, y, radius, 0, 2 * Math.PI);
		this.graphics.fill();
		this.graphics.stroke();

		if(text) {
			this.graphics.textAlign = "center";
			this.graphics.textBaseline = "middle";
			this.graphics.fillStyle = textColor;
			this.graphics.font = "20px Arial"
			this.graphics.fillText(text, x, y);
		}
	}

	drawInlays() {
		this.graphics.beginPath();

		let doubleDotted = [12, 24];
		let singleDotted = [3, 5, 7, 9, 15, 17, 19, 21, 24];

		// TODO: draw text

		for(let fret of doubleDotted) {
			if(fret > this.minFret + this.numFrets) continue;
			if(fret < this.minFret) continue;
			let x = this.fretCenter(fret);

			this.graphics.beginPath();
			this.graphics.arc(x, this.stringTop(0), 10, 0, Math.PI * 2);
			this.graphics.arc(x, this.stringBottom(this.strings.length - 1), 10, 0, Math.PI * 2);
			this.graphics.fillStyle = this.colors.inlay;
			this.graphics.fill();
		}

		for(let fret of singleDotted) {
			if(fret > this.minFret + this.numFrets) continue;
			if(fret < this.minFret) continue;
			let x = this.fretCenter(fret);
			let y: number;
			if((this.strings.length % 2) == 0)
				y = this.stringBottom(this.strings.length / 2);
			else
				y = this.stringTop(0);

			this.graphics.beginPath();
			this.graphics.arc(x, y, 10, 0, Math.PI * 2);
			this.graphics.fillStyle = this.colors.inlay;
			this.graphics.fill();
		}
	}

	pickString(y: number): number {
		return Math.floor((this.height - y) / this.stringHeight);
	}

	pickFret(x: number) {
		return Math.floor((x - this.fretPosition(0)) / this.fretWidth);
	}

	saveAsImage(filename: string = "Fretboard.png") {
		let image = this.canvas.toDataURL("image/png", 1).replace('image/png', 'image/octet-stream');

		let dlLink = document.createElement('a');
		dlLink.setAttribute('href', image);
		dlLink.setAttribute('download', filename);
		dlLink.click();
	}
};

function main() {
	let canvas = document.getElementById("MainCanvas") as HTMLCanvasElement;
	canvas.width = document.documentElement.clientWidth;
	canvas.height = canvas.width / 5;

	let fretboard = new Fretboard(canvas);

	let highlight = null;

	function redraw() {
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
						name == "R"? "highlight1" : "default"
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
