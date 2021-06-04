export function generate<T>(fn: (i: number) => T, n: number, n2?: number) {
	let start = 0;
	let end = n;

	if(n2 !== undefined) {
		start = n;
		end = n2 + 1;
	}

	let result = [] as T[];

	for(let i = start; i < end; i++)
		result.push(fn(i));

	return result;
}
