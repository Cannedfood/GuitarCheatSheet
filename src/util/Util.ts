export
function generate<T>(fn: (i: number) => T, n: number, n2?: number) {
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
function titleCase(str: string) {
	return str.replace(/\b\w/g, letter => letter.toUpperCase());
}

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

export
function oxfordCommaOr(array: string[]) {
	if(array.length == 1)
		return array[0];

	let result = "";
	for(let i = 0; i < array.length; i++) {
		if(i == array.length - 1)
			result += ", or ";
		else if(i > 0)
			result += ", ";
		result += array[i];
	}
	return result;
}