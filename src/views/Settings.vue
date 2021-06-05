<template lang="pug">
.settings(v-if="state.mode == 'settings'")
	.row.big
		label.w-2 End Fret
		input(type="number" min="0" max="24" default="12" v-model="state.endFret")
	.row.big
		label.w-2 Start Fret
		input(type="number" min="0" max="24" default="0" v-model="state.startFret")
	.row.big
		label.w-2 Tuning
		input(type="string" v-model="state.tuning")
	.big Tuning presets:
	library(:entries="tunings" v-model="state.tuning")
</template>

<script lang="ts">
import { defineComponent, inject } from "vue";
import { tunings } from '../util/Libraries'

export default defineComponent({
	setup() { return { state: inject('state'), tunings } }
})
</script>

<style lang="scss">

</style>
