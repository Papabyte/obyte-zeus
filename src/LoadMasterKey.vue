<template>
	<div id="load-master-key" class="main-page">
		<HeadPage/>
			<div class="page-title in-line">Load master key</div>
		<hr />
			<div v-if="step=='initial'">
				<div class="instructions">
					Open the full master key file or one secret share file
				</div>
				<div class="load-file-wrapper">
				<LoadFile @load="onInitialLoad($event)"/>
				</div>

			</div>
			<div v-if="step=='load_from_full_master_key'">
								<div class="instructions">

				Enter the passphrase corresponding to the full master key:
								</div>

				<InputPassphraseAndDecrypt :objFromFile="objFromFirstFile"  @decrypted="onMasterKeyDecrypted($event)"/>
			</div>
			<div v-if="step=='load_from_full_shares'">
				Enter the passphrase for {{objFromFirstFile.owner_name}}'s' share:
				<InputPassphraseAndDecrypt :objFromFile="objFromFirstFile"  @decrypted="onShareDecrypted($event)"/>
				<div v-for= "index in (objFromFirstFile.required_shares-1)" :key="'file_'+ index">
					<LoadFileAndDecrypt @decrypted="onShareDecrypted($event)" :index="index"/>
			</div>
			<div v-if="step=='master_key_decrypted'">
				{{master_key}}
			</div>

		</div>
	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LoadFile from './components/LoadFile.vue'
import InputPassphraseAndDecrypt from './components/InputPassphraseAndDecrypt.vue'
import LoadFileAndDecrypt from './components/LoadFileAndDecrypt.vue'


export default {
	name: 'loadmasterkey',
	components: {
		HeadPage,
		LoadFile,
		InputPassphraseAndDecrypt,
		LoadFileAndDecrypt
	},
	props:{
		config:{
			type: Object
		}
	},
	data:function(){
		return {
			step : "initial",
			objFromFirstFile : {},
			master_key:"",
			arrSecretShares: [],
			master_key_b64:""

		}
	},
	methods:{
		//determine if the first file loaded is a full key or a secret share
		onInitialLoad:function(objFromFile){
			if (objFromFile.type == "master"){
				this.step = "load_from_full_master_key";
				this.objFromFirstFile = objFromFile;
			} else if (objFromFile.type == "share"){
				this.step = "load_from_full_shares";
				this.objFromFirstFile = objFromFile;
			}

		},
		onShareDecrypted: function(decrypted_data){
			this.arrSecretShares.push(decrypted_data);
			if (Number(this.objFromFirstFile.keys_set_properties.required_shares) === this.arrSecretShares.length)
				this.combineSecrets()

		},
		onMasterKeyDecrypted: function(decrypted_data){
			this.master_key_b64 = decrypted_data;
			this.goNext();
		},
		combineSecrets: function(){
			const sss = require('secrets.js-grempe');
			this.master_key_b64 = Buffer.from(sss.combine(this.arrSecretShares),'hex').toString('base64');
			this.goNext();
		},
		goNext: function(){
//new_set_of_keys_existing_address
//new_set_of_keys_new_address
//renew_set_of_keys
//renew_production_key

			if (this.config.action == "renew_set_of_keys"){
				this.$router.push({
					name:'createmasterkey', 
					params:{
						config:this.config,
						previous_master_key_b64: this.master_key_b64
					}
				});
			}

			if (this.config.action == "renew_production_key"){
				this.$router.push({
					name:'download_prod_key_and_change_definition', 
					params:{
						config:this.config,
						keys_set_properties: this.objFromFirstFile.keys_set_properties,
						master_private_key_b64: this.master_key_b64,
					}
				});
			}

		}

	},	
	created: function() {
		if (!this.config) //return home if no config
			this.$router.replace('/');

			
	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';

	.next-action{
		padding-left: 5px;
		font-style:italic;
	}

	.instructions{
		padding: 20px;
	}

	.load-file-wrapper{
		padding-left: 20px;

	}
</style>
