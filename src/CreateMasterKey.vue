<template>
	<div id="create-master-key" class="main-page">
			<HeadPage/>

		<div class="page-title">Create a new set of keys</div>
		<hr />
		<div v-if="!is_secret_created">
			<div v-if="!config.is_existing_address" id="input-address">
					Enter the address of your existing oracle or address for which you want to create a set of keys:
					<input type="text" v-model="address" placeholder="ex: GMHFBTV6D3R3TJ5EJAAUM55EXWNXCJIT" class="address-input">
			</div>

			<div v-if="!config.is_existing_address" id="shamir-config">
				<div id="shares-config">
					Require 
					<select id="required_shares"
							class="form-control"
							v-model="required_shares">
						<option v-for="index in 8" >{{index}}</option>
					</select>	
					share{{required_shares > 1 ? "s" : ""}} of 
					<select id="total_shares"
							class="form-control"
							v-model="total_shares">
						<option v-for="index in 7" >{{index+1}}</option>
					</select>
					total shares
				</div>
				<div id="name-shares">
					<div v-for="index in total_shares_number">
					Secret share owner {{index}}: <input type="text" v-model="names[index-1]" placeholder="ex: CFO" :id="'name-input-'+index" class="names-input">
					</div>
				</div>
				</div>
					<div>
						<LargeButton v-if="is_valid_address&&is_valid_shamir_config" label= "OK" :onClick="onOk" />
					</div>
				</div>
			<div v-if="is_secret_created">
				Boss master key<EncryptAndDownload type="master" name="boss" :state="states[0]" :onDownload="onDownload" :data="master_private_key" :keys_set_properties="keys_set_properties"/>
				<div v-for="(item, index) in shamir_secret_shares">
					{{names[index]}}'s share<EncryptAndDownload type="share" :state="states[index+1]" :onDownload="onDownload" :name="names[index]" :data="shamir_secret_shares[index]" :keys_set_properties="keys_set_properties"/>
				</div>
				JSON:  {{json}}
			</div>
			<div v-if="is_everything_saved">
				Operation complete
			</div>
	</div>
</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'
import EncryptAndDownload from './components/EncryptAndDownload.vue'
const crypto = require('crypto');
const secp256k1 = require('secp256k1');
const byteball = require('byteball');

const { getChash160 } = require('byteball/lib/utils');

export default {
	name: 'createmasterkey',
	components: {
		HeadPage,
		LargeButton,
		EncryptAndDownload
	},
	props:{
		config:{
			type: Object
		}
	},
	data:function(){
		return {
			is_secret_created: false,
			is_valid_address: false,
			is_everything_saved: false,
			address: null,
			is_valid_shamir_config: false,
			master_private_key: null,
			master_private_key_b64: null,
			production_private_key: null,
			production_private_key_b64: null,
			master_public_key_b64: null,
			production_public_key_b64: null,
			required_shares: 1,
			total_shares: 2,
			total_shares_number : 2,
			names:[],
			shamir_secret_shares: [],
			keys_set_properties: {},
			states:[],
			json:""

		}
	},
	methods:{
		onDownload: function(){
			this.json = JSON.stringify(this.states);
			for (var i = 0; i< this.states.length; i++){
				if (!this.states[i].is_downloaded)
					return this.is_everything_saved = false;
			}
			return this.is_everything_saved = true;
		},
		onOk: function(){
			this.keys_set_properties.required_shares = this.required_shares;
			this.keys_set_properties.total_shares = this.total_shares_number;
			this.keys_set_properties.address = this.address;
			this.createShamirSecretShares();
			this.is_secret_created = true;
		},
		//check that all share owners have been named for the total number of shares configured
		checkShamirConfig(){
				for (var i = 0 ; i < this.total_shares; i++){
					if (!this.names[i] || this.names[i].length < 2){
						return this.is_valid_shamir_config = false;
					}
				}
				return this.is_valid_shamir_config = true;

		},
		createShamirSecretShares(){
			const sss = require('shamirs-secret-sharing')
			this.shamir_secret_shares = sss.split(this.master_private_key, { shares: this.total_shares_number, threshold: Number(this.required_shares) })
			this.states = [];
			for(var i = 0; i < this.shamir_secret_shares.length + 1; i++){
					this.states[i] = {is_downloaded:false};
			}
						this.json = JSON.stringify(this.states);

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

		this.master_private_key_b64 = this.master_private_key.toString('base64');
		this.production_private_key_b64 = this.production_private_key.toString('base64');

		//creation of production and master public keys
		this.master_public_key_b64 = secp256k1.publicKeyCreate(this.master_private_key).toString('base64');
		this.production_public_key_b64 = secp256k1.publicKeyCreate(this.production_private_key).toString('base64');

		this.keys_set_properties.address_definition = 
		['or',
			['and', 
				[
					"sig",
					{
						"pubkey": this.production_public_key_b64
					}
				],
				[
					"not", ["has definition change", ["this address", "any"]]
				],
			],
			[
				"sig",
				{
					"pubkey": this.master_public_key_b64
				}
			]
		];

		if (!this.config.is_existing_address)
			this.address = getChash160(this.keys_set_properties.address_definition);


	}



}
</script>

<style lang='scss'>
	@import './assets/css/main.css';

	#input-address{
		padding-top: 50px;
		padding-left: 20px;
	}

	#shares-config{
		padding-top: 30px;
		padding-left: 20px;
	}

	#name-shares{
		padding-top: 30px;
		padding-left: 20px;
	}
</style>
