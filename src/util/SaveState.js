import _ from 'underscore'

var debouncedStateSavers = {}

export
function save(name, value) {
	let saveState = debouncedStateSavers[name];
	if(!saveState) {
		saveState = _.debounce(value => {
			localStorage.setItem(name, JSON.stringify(value));
		}, 1000);
		debouncedStateSavers[name] = saveState;
	}
	saveState(value);
}

export
function load(name) {
	return JSON.parse(localStorage.getItem(name));
}

export
function apply(name, to) {
	let state = load(name);
	for(const key in state) {
		const value = state[key];
		to[key] = value;
	}
}
