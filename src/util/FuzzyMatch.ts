import { shellSimilarity } from "./Util";

export default function fuzzyMatch(
	names: string[],
	lookUp: string,
	numResults = 100,
) {
	lookUp = lookUp.toLowerCase().trim();
	try {
		return names
			.map((n) => ({
				dist: shellSimilarity(n, lookUp),
				value: n,
			}))
			.sort((a, b) => b.dist - a.dist)
			.map((v) => v.value)
			.slice(0, numResults);
	} catch (e) {
		console.log(e);
		return [];
	}
}
