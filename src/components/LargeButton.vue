<template>
	<div class="large-button">
		<div class="label" @click="onClick">
			{{label}}
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