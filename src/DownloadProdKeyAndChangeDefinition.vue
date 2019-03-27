<template>
	<div id="get-production-key" class="main-page">
		<HeadPage/>

		<div class="page-title">Save production key for {{keys_set_properties.address}}</div>
		<hr />
		<div>
			<div v-for="line in arr_initialization_logs">
				{{line}}
			</div>
		</div>
		<div v-if = "step == 'download' || step == 'broadcast'">
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
			<LargeButton v-if="can_be_activated" label= "Activate this production key" :onClick="broadcast" class="button-ok"/>
				<div v-for="line in arr_broadcast_logs">
				{{line}}
			</div>
		</div>
		<div v-if = "instructions_when_complete">
			<div class="completed">
				{{instructions_when_complete}}
			</div>
		</div>
		<div class='broadcast-error'>
				<span v-if="error" class="error">{{error}}</span>
		</div>
	</div>

</template>

<script>
import EncryptAndDownload from './components/EncryptAndDownload.vue'
import HeadPage from './components/HeadPage.vue'
import { getArrDefinition, master_key_signing_path, hub_testnet, hub } from './modules/conf.js'
import LargeButton from './components/LargeButton.vue'

const secp256k1 = require('secp256k1');
const { toWif, getChash160 } = require('obyte/lib/utils');
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
		production_private_hd_key: {
			type: Object,
			default: function(){
				return {}
			}

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
		},
		master_private_key_b64: {
			type: String,
			default: null
		}

	},
	data: function(){
		return {
			step: "initial",
			state: {},
			error: '',
			data_to_be_encrypted: "",
			can_be_activated: false,
			result: null,
			new_derivation_index: null,
			array_former_definition: null,
			arr_initialization_logs: [],
			arr_broadcast_logs :[],
			instructions_when_complete: null
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
		checkSolvency: function(client, handle){

			const addresses = [this.keys_set_properties.address];
			this.arr_initialization_logs.push("Requesting balance for  " + this.keys_set_properties.address);
			client.api.getBalances(addresses, (err, result)=> {
				if (err)
					return handle(err);
				const balance = result[this.keys_set_properties.address] && result[this.keys_set_properties.address].base ? result[this.keys_set_properties.address].base.stable + result[this.keys_set_properties.address].base.pending : 0 ;
				this.arr_initialization_logs.push("Balance available  " + balance);
				if (balance > 2000){
					this.can_be_activated = true;
					return handle(null);
				} else{
					return handle("Only " + balance + " bytes available on this address. At least 2000 bytes required to broadcast definition change");
				}
			});


		},
		broadcast: function(){
			this.can_be_activated = false;
			const selected_hub = this.config.is_testnet ? hub_testnet : hub;
			this.arr_broadcast_logs.push("Connecting to hub " + hselected_hubub);
			const client = new obyte_js.Client(selected_hub, { testnet: (!!this.config.is_testnet) });
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
			this.arr_broadcast_logs.push("Former definition " + this.array_former_definition);

			this.arr_broadcast_logs.push("Posting address definition change" + hub);

			client.post.addressDefinitionChange(params, conf, (err, unit)=> {
				this.broadcast_log = "<br>Closing connection";
				client.close();
				if (err){
					this.error = err;
					this.can_be_activated = true;
				}
				this.arr_broadcast_logs.push("Definition change acknowledged in unit: " + unit);
				this.instructions_when_complete = "All steps completed."
			});

		},
		determineLastDerivationIndex: function(client, previous_master_public_key_b64, previous_production_private_hd_key, handle){
			this.arr_initialization_logs.push("Requesting definition chash for  " + this.keys_set_properties.address);

			client.api.getDefinitionChash({address: this.keys_set_properties.address}, (err, chash)=>{
				if (err)
					this.error = "Request error: " + err;

				this.arr_initialization_logs.push("Current definition chash: " + chash);

				for (var i = 0; i < 100; i++){
					var production_public_key_b64 = previous_production_private_hd_key.hdPublicKey.derive('m/' + i ).publicKey.toBuffer().toString('base64');
					var array_former_definition = getArrDefinition(previous_master_public_key_b64, production_public_key_b64);
	
					if (chash == getChash160(array_former_definition)){
						return handle(null, i, array_former_definition);
					}
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
	mounted: function(){
		var production_private_key_b64;
		if (this.config.action == 'renew_set_of_keys' || this.config.action == 'renew_production_key'){

			const previous_production_private_hd_key = new bitcore.HDPrivateKey(Buffer.from(this.previous_production_private_hd_key_b64, 'base64'));
			const previous_master_public_key_b64 = secp256k1.publicKeyCreate(Buffer.from(this.previous_master_private_key_b64, 'base64')).toString('base64');
		
			const selected_hub = this.config.is_testnet ? hub_testnet : hub;
			this.arr_initialization_logs.push("Connect to hub " + selected_hub );
			const client = new obyte_js.Client((this.config.is_testnet ? hub_testnet : hub), { testnet: (!!this.config.is_testnet) });

			this.checkSolvency(client, (err)=>{
				if (err)
					return this.error = err;
				this.determineLastDerivationIndex(client, previous_master_public_key_b64, previous_production_private_hd_key, (err, index, array_former_definition) => {
					if (err)
						return this.error = err;

					this.arr_initialization_logs.push("Current derivation index: " + index);
					this.array_former_definition = array_former_definition;
					if ( this.config.action == 'renew_production_key'){
						this.arr_initialization_logs.push("New production key will be derived from index " + (index + 1));
						const production_private_key = previous_production_private_hd_key.derive('m/' + (index + 1)).privateKey;
						production_private_key_b64 = production_private_key.toBuffer().toString('base64');
						const master_public_key_b64 = secp256k1.publicKeyCreate(Buffer.from(this.master_private_key_b64, 'base64')).toString('base64');
						const production_public_key_b64 = production_private_key.toPublicKey().toBuffer().toString('base64');
						this.keys_set_properties.arrDefinition = getArrDefinition(master_public_key_b64, production_public_key_b64);
						this.keys_set_properties.definition_chash = getChash160(this.keys_set_properties.arrDefinition);

					} else{
						production_private_key_b64 = this.production_private_hd_key.derive('m/0').privateKey.toBuffer().toString('base64');
					}
					this.arr_initialization_logs.push("Close connection");

					this.data_to_be_encrypted = production_private_key_b64 + "-" + getChash160(production_private_key_b64);
					this.step = 'download';

				});

			});

		} else if (this.config.action == 'new_set_of_keys_existing_address' || this.config.action == 'new_set_of_keys_new_address'){
			production_private_key_b64 = this.production_private_hd_key.derive('m/0').privateKey.toBuffer().toString('base64');

			this.data_to_be_encrypted = production_private_key_b64 + "-" + getChash160(production_private_key_b64);

			this.step = 'download';
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

	.completed {
		text-align:center;
		padding-top:40px;
		font-size: 25px;
	}
</style>
