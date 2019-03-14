<template>
  <div id="load-master-key" class="main-page">
Load master key

	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'

export default {
	name: 'loadmasterkey',
	components: {
		HeadPage,
		LargeButton
	},
	props:{
		config:{
			type: Object
		}
	},
	data:function(){
		return {

			}
	},
	methods:{

	},	
	created: function() {
		if (!this.config) //return home if no config
			this.$router.replace('/');
	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';
</style>
