<template>
  <div id="get-production-key" class="main-page">
		<HeadPage/>

		<div class="page-title">Save production key</div>
		<hr />
	  <div >
	  		<div class="action-title">
					Production key
			</div>
				<div class="owner-width table-header">Owner</div>

				<div class="passphrase passphrase-width table-header">
					Passphrase
				</div>
				<div class="icon-download-width table-header">
					<span>Save</span>
				</div>
				<EncryptAndDownload type="prod" name="IT team" :state="state" :onDownload="onDownload" :data="production_private_key.toString('base64')" :keys_set_properties="keys_set_properties" />
	</div>
	<div v-if = "step == 'broadcast'">
		broadcast
		{{master_private_key.toString('base64')}} - {{address}} - {{new_definition_chash}} - 
	</div>
	<div v-if = "step == 'complete'">
		{{instructions_when_complete}}
	</div>
	</div>

</template>

<script>
import EncryptAndDownload from './components/EncryptAndDownload.vue'
import HeadPage from './components/HeadPage.vue'

const crypto = require('crypto');
const secp256k1 = require('secp256k1');

export default {
	name: 'download_prod_key_and_change_definition',
	components: {
		EncryptAndDownload,
		HeadPage
	},
	props:{
		config:{
			type: Object,
			required: true
		},
		new_definition_chash:{
			type: String
		},
		address:{
			type: String,
			required: true
		},
		production_private_key:{
			type: String
		},
		master_private_key:{
			type: Buffer
		},
		keys_set_properties:{
			type: Object,
			required: true
		}

	},
	data:function(){
		return {
			step : "initial",
			state: {}
		}
	},
	methods:{
		onDownload:function(){
	
			if (this.config.action == 'new_set_of_keys_existing_address' || this.config.action == 'new_set_of_keys_new_address'){
				this.step = "complete";
				this.instructions_when_complete = "All steps completed."
			}

			if (this.config.action == 'renew_set_of_keys' || this.config.action == 'renew_production_key'){
				this.step = "broadcast";
			}
		}
	
	},	
	created: function() {

		if (!this.config) //return home if no config
			this.$router.replace('/');

		//if no production key specified we create a new one
		if (!this.production_private_key){
			do {
				this.production_private_key = crypto.randomBytes(32);
			} while (!secp256k1.privateKeyVerify(this.production_private_key))
	
			//creation of production and master public keys
			var master_public_key_b64 = secp256k1.publicKeyCreate(this.master_private_key).toString('base64');
			var production_public_key_b64 = secp256k1.publicKeyCreate(this.production_private_key).toString('base64');
			this.new_definition_chash = getChash160(getArrDefinition(master_public_key_b64, production_public_key_b64));
		}


	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';
</style>
