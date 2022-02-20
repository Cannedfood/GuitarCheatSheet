<template lang="pug">
.library
	.category(v-for="cat of categories" :key="cat.name")
			h5
				label(:for="cat.name") {{cat.name}}
				select(hidden :id="cat.name")
					option(v-for="e in cat.entries" :value="e") {{e.name}}
			a.entry(
				v-for="e of cat.entries" :key="e.name"
				@click.stop="select(e)"
				:class="{ selected: isSelected(e) }"
			) {{e.name}}
</template>

<style lang="scss">
.library {
	width: fit-content;
	display: flex;
	flex: nowrap row;

	background: #333;
	padding-bottom: 1em;

	.category{
		display: flex;
		flex-flow: nowrap column;
		&>* {
			padding: .5em;
		}
	}

	.entry {
		white-space: nowrap;
		text-align: left;
		cursor: pointer;

		&:hover {
			background: #0002;
		}
		&.selected {
			background: #FFF4;
		}
	}
}
</style>

<script lang="ts">
import { computed, defineComponent, PropType } from "vue";

interface Entry {
	name: string;
	category: string;
	value?: any;
}

function findOrCreate<T>(arr: T[], predicate: (v: T) => boolean, create: () => T) {
	for(let v of arr) {
		if(predicate(v))
			return v;
	}
	let result = create();
	arr.push(result);
	return result;
}

export default defineComponent({
	props: {
		entries: { type: Array as PropType<Entry[]>, required: true },
		modelValue: { required: false },
	},
	emits: ['update:modelValue'],
	setup(props, { emit }) {
		return {
			categories: computed(() => {
				let categories = [] as { name: string, entries: Entry[] }[];
				for(let e of props.entries) {
					let category = findOrCreate(categories,
						c => c.name == e.category,
						() => ({ name: e.category, entries: [] })
					);
					category.entries.push(e);
				}
				return categories;
			}),
			select(entry: Entry) {
				if(entry.value !== undefined)
					emit("update:modelValue", entry.value);
				else
					emit("update:modelValue", entry.name);
			},
			isSelected(entry: Entry) {
				if(entry.value !== undefined)
					return entry.value == props.modelValue;
				else
					return entry.name == props.modelValue;
			}
		}
	}
})
</script>
