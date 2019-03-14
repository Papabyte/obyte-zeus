<template>
  <div id="create-master-key" class="main-page">
Create master key

	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'

export default {
	name: 'createmasterkey',
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
