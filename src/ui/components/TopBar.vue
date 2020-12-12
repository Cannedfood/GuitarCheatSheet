<template lang="pug">
nav.navbar.navbar-expand.navbar-light
	ul.navbar-nav
		li.nav-item(v-for="option in options" v-bind:class="{ active: option == selected }")
			a.nav-link(role="button" v-on:click.stop="select(option)") {{nameOf(option)}}
</template>

<style>
</style>

<script>
export default {
	props: {
		value: { required: true },
		options: { type: Array, required: true }
	},
	computed: {
		selected() { return this.options.filter(o => (o == this.value || o.value == this.value || o.name == this.value))[0]; }
	},
	methods: {
		select(option) { this.$emit('input', this.valueOf(option)); },
		nameOf(option) { return option.name || option },
		valueOf(option) { return option.value || option.name || option }
	}
}
</script>
