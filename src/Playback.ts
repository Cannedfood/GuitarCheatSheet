import { Note } from "@tonaljs/tonal";

class Playback {
	private _context_var: AudioContext | undefined;

	private _context() {
		if(!this._context_var) {
			this._context_var = new window.AudioContext();
		}
		return this._context_var;
	}

	public play(note: string, timeOffset: number = 0) {
		let context = this._context();
		let oscillator = context.createOscillator()
	}
}
