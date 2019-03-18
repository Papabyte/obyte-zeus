<template>
	<div class="large-button">
		<div class="label" @click="onClick">
		<img v-if="label=='back'" src="arrow-back.svg">
		<div v-else>{{label}}</div>
		</div>

	</div>
</template>

<script>
export default {
	name: 'LargeButton',
	props:  {
		onClick: {
			type: Function,
			required: true
		},
		label:{
			type: String,
			required: true
		}
	}
}
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
</style>