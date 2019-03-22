<template>
  <div id="get-production-key" class="main-page">
		<HeadPage/>

		<div class="page-title">Save production key for {{keys_set_properties.address}}</div>
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
		<div class='broadcast-error'>
			<span v-if="error" class="error">{{error}} <a class="error-action" @click="retry">retry</a></span>
		</div>
		<LargeButton v-if="can_be_activated" label= "Activate this production key" :onClick="broadcast" class="button-ok"/>
		{{result}}
	</div>
	<div v-if = "step == 'complete'">
		{{instructions_when_complete}}
	</div>
	</div>

</template>

<script>
import EncryptAndDownload from './components/EncryptAndDownload.vue'
import HeadPage from './components/HeadPage.vue'
import { getArrDefinition, version, master_key_signing_path, hub_testnet, hub } from './modules/conf.js'
import LargeButton from './components/LargeButton.vue'

const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const { toWif, getChash160 } = require('byteball/lib/utils');
const obyte_js = require('byteball');


export default {
	name: 'download_prod_key_and_change_definition',
	components: {
		EncryptAndDownload,
		HeadPage,
		LargeButton
	},
	props:{
		config:{
			type: Object,
			required: true
		},
		new_definition_chash:{
			type: String
		},
		production_private_key:{
			type: String,
			default: null
		},
		master_private_key_b64:{
			type: String
		},
		keys_set_properties:{
			type: Object,
			required: true
		}

	},
	data:function(){
		return {
			step : "initial",
			state: {},
			balance: 0,
			error:'',
			can_be_activated: false,
			result: null,
			arrDefinition: []
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
				this.checkSolvency();
			}
		},
		checkSolvency: function(){
			console.log("checkSolvency");
			console.log(hub_testnet);
						console.log(hub);

			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (this.config.is_testnet ? true :false) });
			const addresses = [this.keys_set_properties.address];

			client.api.getBalances(addresses, (err, result)=> {
				this.error = err;
				this.balance = result[this.keys_set_properties.address] && result[this.keys_set_properties.address].base ? result[this.keys_set_properties.address].base.stable + result[this.keys_set_properties.address].base.pending : 0 ;
				if (this.balance > 2000)
					this.can_be_activated = true;
				else
					this.error = "Address insufficiently funded to broadcast a definition change";
			});


		},
		broadcast: function(){
			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (this.config.is_testnet ? true :false) });
			const addresses = [this.keys_set_properties.address];

			const wif = toWif(Buffer.from(this.master_private_key_b64, 'base64'), true);

			const params =   {
				definition_chash: this.keys_set_properties.new_definition_chash
			}

			const conf = {
				wif: wif,
				address: this.keys_set_properties.address,
				path: master_key_signing_path,
				definition: this.keys_set_properties.arrDefinition,
				testnet: true
			};

			client.post.addressDefinitionChange(params, conf, (err, result)=> {
				this.error = err;
				this.result = result;
			});

		}
	
	},	
	created: function() {

		if (!this.config) //return home if no config
			this.$router.replace('/');
console.log(this.config);
		//if no production key specified we create a new one
		if (!this.production_private_key){
			console.log("create production_private_key");
			do {
				this.production_private_key = crypto.randomBytes(32);
			} while (!secp256k1.privateKeyVerify(this.production_private_key))
	
			//creation of production and master public keys
			var master_public_key_b64 = secp256k1.publicKeyCreate(Buffer.from(this.master_private_key_b64, 'base64')).toString('base64');
			var production_public_key_b64 = secp256k1.publicKeyCreate(this.production_private_key).toString('base64');
			this.keys_set_properties.new_definition_chash = getChash160(getArrDefinition(master_public_key_b64, production_public_key_b64));
			this.keys_set_properties.arrDefinition = getArrDefinition(master_public_key_b64, production_public_key_b64);
		}

	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';

	.broadcast-error{
		color:red;
		text-align:center;
		padding-top:40px;
	}
</style>
