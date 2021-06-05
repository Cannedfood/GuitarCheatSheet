import levenshtein from "js-levenshtein";

export default
function fuzzyMatch(names: string[], name: string) {
	name = name.toLowerCase().trimLeft();
	try {
		let [chroma, lookUp] = name.split(/ (.*)/);
		return (
			names
			.map(n => ({
				dist: levenshtein(n, lookUp),
				value: n
			}))
			.sort((a, b) => a.dist - b.dist)
			.map(v => v.value)
			.slice(0, 3)
			.map(n => `${chroma} ${n}`)
			.map(n => n.replace(/\b\w/g, letter => letter.toUpperCase()))
		)
	}
	catch(e) {
		console.log(e);
		return []
	}
}
