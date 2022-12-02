export type Note = string | NoteDescription;

export interface NoteDescription {
	note: string,
	fret?: number,
	string?: number,
	color?: string,
	text?: string,
}

export interface Highlight {
	string?: number;
	endString?: number;
	fret?: number;
	endFret?: number;
	fill?: string;
	outline?: string;
}

export interface FretboardPosition {
    x: number;
    y: number;
    fret: number;
    string: number;
    note: string;
}
