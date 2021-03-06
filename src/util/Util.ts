export function generate<T>(fn: (i: number) => T, n: number, n2?: number) {
	let start = 0;
	let end = n;

	if (n2 !== undefined) {
		start = n;
		end = n2 + 1;
	}

	let result = [] as T[];

	for (let i = start; i < end; i++)
		result.push(fn(i));

	return result;
}

export
function shuffle<T>(array: T[]): T[] {
	let currentIndex = array.length;
	let randomIndex: number = undefined;

	// While there remain elements to shuffle...
	while (currentIndex !== 0) {
		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}

export
function sample<T>(array: T[]): T {
	return array[Math.floor(Math.random() * array.length)]
}

export
function remove<T>(array: T[], filter: (v: T) => boolean) {
	let n = 0;
	for(let i = 0; i < array.length; i++) {
		if(filter(array[i])) {
			array.splice(i, 1);
			n++;
			i--;
		}
	}
	return n;
}

export
function flatten<T>(array: T[]) { return [].concat(...array); }

export
function uniq<T>(array: T[]): T[] { return [...new Set(array)]; }

export
function titleCase(str: string) {
	return str.replace(/\b\w/g, letter => letter.toUpperCase());
}

export
function debounce<T extends Function>(cb: T, wait = 20) {
    let h: NodeJS.Timeout;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return <T>(<any>callable);
}

export
function fallback(...args: any[]) {
	for(let v of args) {
		if(v !== undefined && v !== null)
			return v;
	}
	return undefined;
}

export
function log(base: number, value: number) { return Math.log2(value) / Math.log2(base); }

export
function commonPrefixLength(a: string, b: string) {
	let maxLength = Math.min(a.length, b.length);
	for(let i = 0; i < maxLength; i++) {
		if(a[i] !== b[i])
			return i;
	}
	return maxLength;
}

export
function commonSuffixLength(a: string, b: string) {
	let maxLength = Math.min(a.length, b.length);
	for(let i = 0; i < maxLength; i++) {
		if(a[a.length - 1 - i] !== b[b.length - 1 - i])
			return i;
	}
	return maxLength;
}

export
function shellSimilarity(a: string, b: string) {
	let common = commonPrefixLength(a, b) + commonSuffixLength(a, b);
	return common / Math.max(a.length, b.length);
}
