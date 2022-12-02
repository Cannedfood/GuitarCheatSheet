<script setup lang="ts">
import { useState } from "@/state";
import { tunings } from '../util/Presets'

const state = useState();

</script>

<template lang="pug">
.settings
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
