<template>
	<div id="create-master-key" class="main-page">
		<HeadPage/>

		<div class="page-title">New set of keys creation {{step != 'initial' ? " for " + address : ""}}</div>
		<hr />
		<div v-if="step=='initial'">
			<div v-if="config.is_existing_address" id="input-address">
					<div class="action-title">
						Existing address
					</div>
					<div class="instructions">
					Enter the address of your existing oracle or witness for which you want to create a set of keys:
					</div>
						<input type="text" v-model="address" placeholder="ex: GMHFBTV6D3R3TJ5EJAAUM55EXWNXCJIT" class="address-input">
			</div>
			<div v-if="is_valid_address" id="shamir-config">
				<div class="action-title">
					Shared secret configuration
				</div>
				<div id="shares-config">
					Require 
					<select id="required_shares"
							class="form-control"
							v-model="required_shares">
						<option v-for="index in 8" >{{index+1}}</option>
					</select>	
					shares of 
					<select id="total_shares"
							class="form-control"
							v-model="total_shares">
						<option v-for="index in 8" >{{index+1}}</option>
					</select>
					total shares
				</div>

				<div id="name-shares">
					Full master key owner  <input type="text" v-model="full_master_key_owner_name" placeholder="ex: CEO" class="names-input">
				</div>
				<div id="name-shares">
					<div v-for="index in total_shares_number">
					Secret share owner {{index}}: <input type="text" v-model="names[index-1]" placeholder="ex: CFO" class="names-input">
					</div>
				</div>
				</div>
					<div>
						<LargeButton v-if="is_valid_address&&is_valid_shamir_config" label= "OK" :onClick="onOk" class="button-ok"/>
					</div>
				</div>
			<div v-if="step=='secret_created'||step=='propose_prod_key_download'||step=='download_script'">
				<div class="instructions">
					Write down carefully each passphrase before downloading the file it encrypts. For security reason, don't transmit the file and the passphrase using the same medium. A good pratice is to save the file on an USB stick and to write the seed on paper. Then each secret owner should store file and passphrase in separate locations.
				</div>
				<div class="action-title">
					Full master key
				</div>
				<div class="owner-width table-header">Owner</div>

				<div class="passphrase passphrase-width table-header">
					Passphrase
				</div>
				<div class="icon-download-width table-header">
					<span>Save</span>
				</div>
				<EncryptAndDownload type="master" :name="full_master_key_owner_name" :state="states[0]" :onDownload="onDownload" :data="master_private_key.toString('base64')" :keys_set_properties="keys_set_properties" />
				<div class="action-title">
					Master key shares
				</div>
				<div class="owner-width table-header"> Owner</div>

				<div class="passphrase passphrase-width table-header">
					Passphrase
				</div>
				<div class="icon-download-width table-header">
					<span>Save</span>
				</div>

				<div v-for="(item, index) in shamir_secret_shares">
					<EncryptAndDownload  type="share" :state="states[index+1]" :onDownload="onDownload" :name="names[index]" :data="shamir_secret_shares[index]" :keys_set_properties="keys_set_properties" />
					<hr v-if="index!=(shamir_secret_shares.length-1)" class="download-separator" />
				</div>

				<div v-if="!are_full_key_and_shares_saved" class="status">
						{{remaining_savings}} files left to save.
				</div>
			</div>
			<div v-if="step=='download_script'">
				<CreateAndDownloadDefinitionChangeScript :onDownload="setPropKeyDownloadStep" :address="address" :new_definition_chash="new_definition_chash" :keys_set_properties="keys_set_properties" />
			</div>

			<div v-if="step=='propose_prod_key_download'">
				<LargeButton label="save prod key" :onClick="downloadProdKey" class="button-ok"/>
			</div>
	</div>
</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'
import EncryptAndDownload from './components/EncryptAndDownload.vue'
import CreateAndDownloadDefinitionChangeScript from './components/CreateAndDownloadDefinitionChangeScript.vue'


import { getArrDefinition, version } from './modules/conf.js'

const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const byteball = require('byteball');

const { getChash160 } = require('byteball/lib/utils');

export default {
	name: 'createmasterkey',
	components: {
		HeadPage,
		LargeButton,
		EncryptAndDownload,
		CreateAndDownloadDefinitionChangeScript,
	},
	props:{
		config:{
			type: Object
		},
		previous_master_key_b64: {
			type: String
		},
	},
	data:function(){
		return {
			is_valid_address: false,
			are_full_key_and_shares_saved: false,
			address: null,
			is_valid_shamir_config: false,
			master_private_key: null,
			production_private_key: null,
			new_definition_chash: "",
			required_shares: 2,
			total_shares: 2,
			total_shares_number : 2,
			names:[],
			shamir_secret_shares: [],
			keys_set_properties: {},
			states:[],
			full_master_key_owner_name:"",
			remaining_savings: 0,
			step:"initial"
		}
	},
	methods:{
		setPropKeyDownloadStep:function(){
			this.step='propose_prod_key_download';
		},
		downloadProdKey: function(){

			this.$router.push({
				name:'download_prod_key_and_change_definition', 
				params:{
					config:this.config,
					address: this.address,
					production_private_key: this.production_private_key,
					keys_set_properties: this.keys_set_properties,
					master_private_key_b64: this.previous_master_key_b64,
					new_definition_chash: this.new_definition_chash
				}
			});


		},
		//each time a file is downloaded we refresh download countdown and set are_full_key_and_shares_saved=true when finished
		onDownload: function(){
			var count = 0;
			for (var i = 0; i< this.states.length; i++){
				if (!this.states[i].is_downloaded)
					count++			
			}
			this.remaining_savings = count;

			if (count == 0){
				this.are_full_key_and_shares_saved = true;
				if (this.config.is_existing_address)
					this.step='download_script';
				else
					this.step='propose_prod_key_download';
			}
		},
		onOk: function(){
			this.keys_set_properties.required_shares = this.required_shares;
			this.keys_set_properties.total_shares = this.total_shares_number;
			this.keys_set_properties.address = this.address;
			this.createShamirSecretShares();
			this.step = "secret_created";
		},
		//check that all share owners have been named for the total number of shares configured
		checkShamirConfig(){
				for (var i = 0 ; i < this.total_shares; i++){
					if (!this.names[i] || this.names[i].length < 2 ||this.full_master_key_owner_name.length <2 ){
						return this.is_valid_shamir_config = false;
					}
				}
				return this.is_valid_shamir_config = true;

		},
		//in this array there is 1 status object for each file to be dowloaded
		initialize_states_array(length){
			this.states = [];
			for(var i = 0; i < length; i++){
				this.states[i] = {is_downloaded:false};
			}
		},
		createShamirSecretShares(){
			const sss = require('secrets.js-grempe');
			this.shamir_secret_shares = sss.share(this.master_private_key.toString('hex'), this.total_shares_number,Number(this.required_shares));
			var secret = sss.combine(this.shamir_secret_shares.slice(0,2));
			this.initialize_states_array(this.shamir_secret_shares.length + 1);// number of shares + 1 master key
			this.onDownload();
		}
	},
	watch:{
		//total shares cannot be inferior to required shares
		total_shares: function (value) {	
			if (value < this.required_shares)
				this.required_shares = value;
			this.total_shares_number = Number(value);
			this.checkShamirConfig();
		},
		//required shares cannot be superior to required shares
		required_shares: function (value) {	
			if (value > this.total_shares)
				this.total_shares = value;
			this.checkShamirConfig();
		},
		//check that address is valid
		address: function(value){
			this.is_valid_address = value.length == 32;
		},
		names: function(value){
			this.checkShamirConfig();
		}
	},
	created: function() {
		if (!this.config) //return home if no config
			this.$router.replace('/');


		//generation of production and master private keys
		do {
			this.master_private_key = crypto.randomBytes(32);
		} while (!secp256k1.privateKeyVerify(this.master_private_key))

		do {
			this.production_private_key = crypto.randomBytes(32);
		} while (!secp256k1.privateKeyVerify(this.production_private_key))

		//creation of production and master public keys
		var master_public_key_b64 = secp256k1.publicKeyCreate(this.master_private_key).toString('base64');
		var production_public_key_b64 = secp256k1.publicKeyCreate(this.production_private_key).toString('base64');

		this.new_definition_chash = getChash160(getArrDefinition(master_public_key_b64, production_public_key_b64));
		if (!this.config.is_existing_address){
			this.address = this.new_definition_chash;
			this.keys_set_properties.first_definition = getArrDefinition(master_public_key_b64, production_public_key_b64);
		}
		
		//keys_set_properties will be duplicated in every generated file
		this.keys_set_properties.id = Math.floor(Date.now() / 1000);
		this.keys_set_properties.address = this.address;
		this.version = version;

	}

}
</script>

<style lang='scss'>
	@import './assets/css/main.css';

	#input-address{
		padding-left: 20px;
	}

	#shares-config{
		padding-left: 20px;
	}

	#name-shares{
		padding-top: 30px;
		padding-left: 20px;
	}


	.download-separator{
		  border: 1px solid gray;
	}

	.instructions{
		padding:20px;
	}
	.status{
		padding-top: 40px;
		text-align: center;
		color: rgb(114, 5, 5);
	}
	.button-ok{
		margin-top:50px;

	}
</style>
