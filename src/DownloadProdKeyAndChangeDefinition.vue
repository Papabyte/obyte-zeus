<template>
	<div id="get-production-key" class="main-page">
		<HeadPage/>

		<div class="page-title">Save production key for {{keys_set_properties.address}}</div>
		<hr />
		<div v-if = "step == 'initial'">
			Initializing...
		</div>
		<div v-if = "step == 'download'">
			<div class="instructions">
				These file and passphrase are to be used by your IT team.
			</div>
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
			<EncryptAndDownload
				type="prod"
				name="IT team"
				:state="state"
				:onDownload="onDownload"
				:data="data_to_be_encrypted"
				:keys_set_properties="keys_set_properties" />
		</div>
		<div v-if = "step == 'broadcast'">
			<div class='broadcast-error'>
				<span v-if="error" class="error">{{error}} <a class="error-action" @click="retry">retry</a></span>
			</div>
			<LargeButton v-if="can_be_activated" label= "Activate this production key" :onClick="broadcast" class="button-ok"/>
			{{result}}
		</div>
		<div v-if = "step == 'complete'">
			<div class="completed">
				{{instructions_when_complete}}
			</div>
		</div>
	</div>

</template>

<script>
import EncryptAndDownload from './components/EncryptAndDownload.vue'
import HeadPage from './components/HeadPage.vue'
import { getArrDefinition, master_key_signing_path, hub_testnet, hub } from './modules/conf.js'
import LargeButton from './components/LargeButton.vue'

const secp256k1 = require('secp256k1');
const { toWif, getChash160 } = require('byteball/lib/utils');
const obyte_js = require('obyte');
const bitcore = require('bitcore-lib');


export default {
	name: 'download_prod_key_and_change_definition',
	components: {
		EncryptAndDownload,
		HeadPage,
		LargeButton
	},
	props: {
		config: {
			type: Object,
			required: true
		},
		production_private_key_buff: {
			type: Buffer,
			default: null
		},
		production_private_hd_key_b64: {
			type: String,
			default: null

		},
		keys_set_properties: {
			type: Object,
			required: true
		},
		previous_master_private_key_b64: {
			type: String,
			default: null
		},
		previous_production_private_hd_key_b64: {
			type: String,
			default: null
		}

	},
	data: function(){
		return {
			step: "initial",
			state: {},
			balance: 0,
			error: '',
			data_to_be_encrypted: "",
			can_be_activated: false,
			result: null,
			arrDefinition: [],
			new_derivation_index: null,
			array_former_definition: null
		}
	},
	methods: {
		onDownload: function(){
	
			if (this.config.action == 'new_set_of_keys_existing_address' || this.config.action == 'new_set_of_keys_new_address'){
				this.step = "complete";
				this.instructions_when_complete = "All steps completed."
			}
			if (this.config.action == 'renew_set_of_keys' || this.config.action == 'renew_production_key'){
				this.step = "broadcast";
			}
	
		},
		checkSolvency: function(handle){

			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (!!this.config.is_testnet) });
			const addresses = [this.keys_set_properties.address];

			client.api.getBalances(addresses, (err, result)=> {
				this.error = err;
				this.balance = result[this.keys_set_properties.address] && result[this.keys_set_properties.address].base ? result[this.keys_set_properties.address].base.stable + result[this.keys_set_properties.address].base.pending : 0 ;
				if (this.balance > 2000){
					this.can_be_activated = true;
					handle(null);
				} else
					this.error = "Address insufficiently funded to broadcast a definition change";
				handle("insufficient_funds");
			});


		},
		broadcast: function(){
			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (!!this.config.is_testnet) });
			const wif = toWif(Buffer.from(this.previous_master_private_key_b64, 'base64'), true);

			const params =   {
				definition_chash: this.keys_set_properties.definition_chash
			}
			const conf = {
				wif: wif,
				address: this.keys_set_properties.address,
				path: master_key_signing_path,
				definition: this.array_former_definition,
				testnet: this.config.is_testnet
			};

			client.post.addressDefinitionChange(params, conf, (err, result)=> {
				this.error = err;
				this.result = result;
				client.close();
			});

		},
		determineLastDerivationIndex: function(master_public_key_b64, production_private_hd_key, handle){
			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (!!this.config.is_testnet) });

			client.api.getDefinitionChash({address: this.keys_set_properties.address}, function(err, chash) {
				console.log(chash);
				for (var i = 0; i < 100; i++){
					var production_public_key_b64 = production_private_hd_key.hdPublicKey.derive('m/' + i ).toString('base64');
					var array_former_definition = getArrDefinition(master_public_key_b64, production_public_key_b64);
					if (chash == getChash160())
						return handle(null, i, array_former_definition);
				}
				return handle("Couldn't find last derivation index");
			});

		}
	
	},	
	created: function() {

		if (!this.config) //return home if no config
			this.$router.replace('/');
		this.step = "initial";

	
	},
	computed: function(){
		if ( this.config.action == 'renew_production_key'){
			this.production_private_hd_key_b64 = new bitcore.HDPrivateKey().toBuffer().toString('base64');
		}

		if (this.config.action == 'renew_set_of_keys' || this.config.action == 'renew_production_key'){

			const previous_production_private_hd_key = new bitcore.HDPrivateKey(this.previous_production_private_hd_key_b64);
			const previous_master_public_key_b64 = secp256k1.publicKeyCreate(Buffer.from(this.previous_master_private_key_b64, 'base64')).toString('base64');

			this.checkSolvency((err)=>{
				if (err)
					return console.log(err)
				this.determineLastDerivationIndex(previous_master_public_key_b64, previous_production_private_hd_key, (err, index, array_former_definition) => {
					if (err)
						return console.log(err)
					this.array_former_definition = array_former_definition;
					this.previous_derivation_index = index;
					if ( this.config.action == 'renew_production_key'){
						const production_private_hd_key = previous_production_private_hd_key.hdPublicKey.derive('m/' + (index + 1));
						this.production_private_hd_key_b64 = production_private_hd_key.toString('base64');

						const master_public_key_b64 = secp256k1.publicKeyCreate(Buffer.from(this.master_private_key_b64, 'base64')).toBuffer().toString('base64');
						const production_public_key_b64 = production_private_hd_key.toPublicKey().toBuffer().toString('base64');

						this.keys_set_properties.arrDefinition = getArrDefinition(master_public_key_b64, production_public_key_b64);
						this.keys_set_properties.definition_chash = getChash160(this.keys_set_properties.arrDefinition);
					}

				});

			});

		}

		this.data_to_be_encrypted = this.production_private_hd_key_b64 + "-" + getChash160(this.production_private_hd_key_b64);
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

	.completed {
		text-align:center;
		padding-top:40px;
		font-size: 25px;
	}
</style>
