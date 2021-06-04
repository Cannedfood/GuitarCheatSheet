export const tunings = [
	{ category: "Guitar",   name: "E Standard", value: "E2 A2 D3 G3 B3 E4" },
	{ category: "Guitar",   name: "Drop D",     value: "D2 A2 D3 G3 B3 E4" },
	{ category: "7-String", name: "B Standard", value: "B1 E2 A2 D3 G3 B3 E4" },
	{ category: "7-String", name: "Drop A",     value: "A1 E2 A2 D3 G3 B3 E4" },
	{ category: "Bass",     name: "E Standard", value: "E1 A1 D2 G2" },
	{ category: "5-String", name: "B Standard", value: "B0 E1 A1 D2 G2" },
	{ category: "5-String", name: "Drop A",     value: "A0 E1 A1 D2 G2" },
]

export const scales = [
	{ category: "Diatonic", name: "C Lydian" },
	{ category: "Diatonic", name: "C Major (Ionian)" },
	{ category: "Diatonic", name: "C Mixolydian" },
	{ category: "Diatonic", name: "C Dorian" },
	{ category: "Diatonic", name: "C Minor (Aeolian)" },
	{ category: "Diatonic", name: "C Phrygian" },
	{ category: "Diatonic", name: "C Locrian" },
	{ category: "Harmonic", name: "C Harmonic Minor" },
	{ category: "Harmonic", name: "C Locrian #6" },
	{ category: "Harmonic", name: "C Ionian #5" },
	{ category: "Harmonic", name: "C Dorian #4" },
	{ category: "Harmonic", name: "C Phrygian Dominant" },
	{ category: "Harmonic", name: "C Lydian #2" },
	{ category: "Harmonic", name: "C Superlocrian" },
	{ category: "Melodic",  name: "C Melodic Minor" },
	{ category: "Melodic",  name: "C Dorian b2/Phrygian #6" },
	{ category: "Melodic",  name: "C Lydian augmented" },
	{ category: "Melodic",  name: "C Lydian dominant (overtone scale)" },
	{ category: "Melodic",  name: "C Mixolydian b6" },
	{ category: "Melodic",  name: "C Aeolian b5/Locrian #2" },
	{ category: "Melodic",  name: "C Altered/Superlocrian" },
	{ category: "Pentatonic", name: "C Major Pentatonic (Mode I)", value: "C Major Pentatonic" },
	{ category: "Pentatonic", name: "C Egyptian/Dorian Pentatonic (Mode I and V)", value: "C Egyptian" },
	{ category: "Pentatonic", name: "C Minor Pentatonic", value: "C Minor Pentatonic" },
	{ category: "Pentatonic", name: "C Ritusen", value: "C Ritusen" },
	// TODO: Mode III (minor without 2 and 5)
].map(e => ({ category: e.category, name: e.name, value: e.value || e.name.split(/[\(\,\/]/)[0].trim() }))

export const chords = [
	{ category: "Triads", name: "C Major",      value: "C Major" },
	{ category: "Triads", name: "C Minor",      value: "C Minor" },
	{ category: "Triads", name: "C Diminished", value: "C Dim" },
	{ category: "Triads", name: "C Augmented",  value: "C Aug" },
	{ category: "Triads", name: "C Quartal",    value: "C Quartal" },
	{ category: "Triads", name: "C Sus2",       value: "C Sus2" },
	{ category: "Triads", name: "C Sus4",       value: "C Sus4" },

	{ category: "Seventh", name: "C Major 7",    value: "Cmaj7" },
	{ category: "Seventh", name: "C Minor 7",    value: "Cm7" },
	{ category: "Seventh", name: "C Dominant 7", value: "Cdom" },
	{ category: "Seventh", name: "C Minor maj7", value: "CmMaj7" },
]
