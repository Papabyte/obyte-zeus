<template>
  <div id="load-master-key" class="main-page">
	  	<HeadPage/>
			<div class="page-title in-line">Load master key</div>
			<div class="next-action in-line">{{next_action}}</div>
		<hr />
		<div v-if="step=='initial'">
			<div>
				Open the full master key file or one secret share file
			</div>
			<LoadFile @load="onInitialLoad($event)"/>
		</div>
		<div v-if="step=='load_from_full_master_key'">
			<InputPassphraseAndDecrypt :objFromFile="objFromFirstFile"/>
		</div>
	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'
import LoadFile from './components/LoadFile.vue'
import InputPassphraseAndDecrypt from './components/InputPassphraseAndDecrypt.vue'

export default {
	name: 'loadmasterkey',
	components: {
		HeadPage,
		LargeButton,
		LoadFile,
		InputPassphraseAndDecrypt
	},
	props:{
		config:{
			type: Object
		}
	},
	data:function(){
		return {
			step : "initial",
			objFromFirstFile : {}
		}
	},
	methods:{
		onInitialLoad:function(objFromFile){
			if (objFromFile.type == "master"){
				this.step = "load_from_full_master_key";
				this.objFromFirstFile = objFromFile;
			}

		}

	},	
	created: function() {
		if (!this.config) //return home if no config
			this.$router.replace('/');

		switch (this.config.action){
			case "renew_set_of_keys":{
				this.next_action = " - then renew master and production keys";
			}
			case "renew_production_key":{
				this.next_action = " - then renew production key";
			}
			
		}
			
	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';

	.next-action{

		padding-left: 5px;
		font-style:italic;
	}
</style>
