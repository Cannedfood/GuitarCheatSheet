<template lang="pug">
.preset-selector(v-on:click.stop="toggle()" v-bind:class="{clicked,open}") Presets
	.preset-selection
		.preset-group(v-for="group of groups")
			b {{group.name}}
			.preset(v-for="p of group.presets" v-on:click.stop="select(p, $event)") {{p.name}}
</template>

<script>
import { Scale } from '@tonaljs/tonal'

export default {
	props: {
		presets: {
			type: Array,
			required: true,
			validator(presets) {
				for(let preset of presets) {
					if(preset.value === undefined) {
						console.error("Presets must match { value: any, name?: string, group?: string } got ", preset)
						return false;
					}
				}
				return true;
			}
		}
	},
	data() {
		return {
			open: false,
			clicked: false
		};
	},
	computed: {
		groups() {
			let groups = {}

			for(let preset of this.presets) {
				let groupName = preset.group || "misc";
				let group = groups[groupName] || [];
				groups[groupName] = group;

				group.push({
					name: preset.name || preset.value,
					value: preset.value
				});
			}

			let result = [];
			for(const key in groups) {
				result.push({
					name: key,
					presets: groups[key],
				})
			}
			return result;
		}
	},
	methods: {
		toggle() {
			this.open = !this.open;
			this.clicked = true;
		},
		select(preset) {
			this.open = false;
			this.$emit('input', preset.value);
		}
	}
}
</script>

<style>
.preset-selector {
	display: inline-block;

	padding: .3em;
	border-radius: .3em;
	border: 1px solid black;
	background: lightgray;
}
.preset-selection {
	position: absolute;
	width: fit-content;
	height: fit-content;
	max-height: 30em;
	background: gray;
	z-index: 999;

	display: flex;
	flex-flow: row wrap;
}
.preset-group {
	height: 100%;
	display: flex;
	flex-flow: column wrap;

	padding: .3em;
}
.preset {
	padding-left: 1em;
	padding-right: 1em;
	cursor: pointer;
}
.preset:hover {
	background: lightgray;
}

/* Show/Hide */
.preset-selection { visibility: collapse; }
.preset-selector:not(.clicked):hover .preset-selection,
.preset-selector.open  .preset-selection { visibility: visible; }
</style>
