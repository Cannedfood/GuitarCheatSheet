import { reactive, watch } from "vue";
import deepmerge from 'deepmerge'

interface PersistentStateOptions {
	debounceMs?: number;
	versionPattern?: RegExp;
}

export default
function persistentState<T extends Object>(name: string, stateDefaults: T, options?: PersistentStateOptions): T {
	options = Object.assign({
		debounceMs: 300,
		clear: null
	}, options)

	let state = stateDefaults;

	if(options.versionPattern) {
		for(let i = 0; i < localStorage.length; i++) {
			let key = localStorage.key(i);
			if(options.versionPattern.test(key) && key != name) {
				console.log(`Remove old state '${key}'`)
				localStorage.removeItem(key);
			}
		}
	}

	// Try load state
	let entry = localStorage.getItem(name);
	if(entry) {
		try {
			stateDefaults = deepmerge(stateDefaults, JSON.parse(entry)) as T;
		}
		catch(e) {
			console.error(`Failed parsing persistent state "${name}"`, e);
		}
	}

	// Make state reactive
	state = reactive(stateDefaults) as T;

	// Save state when changed
	watch(() => state, debounce(() => {
		localStorage.setItem(name, JSON.stringify(state));
	}, options.debounceMs), { deep: true })

	return state;
}

function debounce<T extends Function>(cb: T, wait = 20) {
    let h: NodeJS.Timeout;
    let callable = (...args: any) => {
        clearTimeout(h);
        h = setTimeout(() => cb(...args), wait);
    };
    return <T>(<any>callable);
}
