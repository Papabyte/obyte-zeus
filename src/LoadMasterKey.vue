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
				Enter the passphrase corrsponding to the full master key:
				<InputPassphraseAndDecrypt :objFromFile="objFromFirstFile"  @decrypted="onMasterKeyDecrypted($event)"/>
			</div>
			<div v-if="step=='load_from_full_shares'">
				Enter the passphrase for {{objFromFirstFile.owner_name}}'s' share:
				<InputPassphraseAndDecrypt :objFromFile="objFromFirstFile"  @decrypted="onShareDecrypted($event)"/>
				<div v-for= "index in (objFromFirstFile.required_shares-1)">
					<LoadFileAndDecrypt @decrypted="onShareDecrypted($event)"/>
			</div>
			<div v-if="step=='master_key_decrypted'">
				{{master_key}}
			</div>

		</div>
	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'
import LoadFile from './components/LoadFile.vue'
import InputPassphraseAndDecrypt from './components/InputPassphraseAndDecrypt.vue'
import LoadFileAndDecrypt from './components/LoadFileAndDecrypt.vue'

export default {
	name: 'loadmasterkey',
	components: {
		HeadPage,
		LargeButton,
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
			console.log(decrypted_data);
			if (Number(this.objFromFirstFile.required_shares) === this.arrSecretShares.length)
				this.combineSecrets()

		},
		onMasterKeyDecrypted: function(decrypted_data){
			this.master_key_b64 = decrypted_data;
		},
		combineSecrets: function(){
			const sss = require('secrets.js-grempe');
			this.master_key_b64 = Buffer.from(sss.combine(this.arrSecretShares),'hex').toString('base64');

		},
		goNextAction: function(){


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
