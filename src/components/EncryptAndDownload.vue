<template>
	<div class="encrypt-download">
		<div class="owner-width"> {{name}}</div>

		<div class="passphrase passphrase-width">
			<div v-if="!is_passphrase_hidden" v-on:click="is_passphrase_hidden=true">
					{{passphrase}}
					<img src="icon-hide.svg" class="icon-hide"  >
			</div>
			<div v-if="is_passphrase_hidden" v-on:click="is_passphrase_hidden=false;is_icon_download_disabled=false;" >
				<img src="icon-show.svg" class="icon-show">
			</div>
		</div>
		<div class="icon-download-width">
				<span v-if="is_icon_download_disabled" ><img src="icon-download-disabled.svg" height="20px"></span>
				<span v-else v-on:click="download" class="icon-download"><img src="icon-download.svg" height="20px"></span>
		</div>
	</div>
</template>

<script>

const generatePassphrase = require('eff-diceware-passphrase')
const aes256 = require('aes256');
import { passphrase_length } from '../modules/conf.js'

export default {
	name: 'EncryptAndDownload',
	props:  {
		keys_set_properties: {
			type: Object,
			required: true
		},
		type:{
			type: String,
			required: true
		},
		data: {
			type: Buffer,
			required: true
		},
		name: {
			type: String,
			required: true
		},
		state:{
			type: Object,
			required: true
		},
		onDownload:{
			type: Function,
			required: true
		}
	},
	data: function(){
		return {
			passphrase: "",
			encrypted_data: "",
			jsonString:"",
			url: null,
			is_passphrase_hidden: true,
			is_icon_download_disabled: true
		}
	},
	methods: {
		download: function(){
			this.is_passphrase_hidden = true;
			this.state.is_downloaded = true;
			const link = document.createElement('a')
			link.href = this.url
			link.setAttribute('download', this.name + '-'+ this.keys_set_properties.address+'-'+this.keys_set_properties.id+'.'+ this.type) //or any other extension
			document.body.appendChild(link)
			link.click()
			this.onDownload();
		}

	},
	created: function(){
		this.passphrase = generatePassphrase(passphrase_length).join(" ");
		this.encrypted_data = aes256.encrypt(this.passphrase, this.data.toString('base64'));
		this.jsonString = JSON.stringify(Object.assign({
			type: this.type, 
			encryption:"AES256", 
			encrypted_data: this.encrypted_data, 
			owner_name: this.name,
			passphrase_length: passphrase_length
		}, this.keys_set_properties));

		console.log(this.jsonString);

			var data = new Blob([this.jsonString], {type: "application/json"});
			// If we are replacing a previously generated file we need to
			// manually revoke the object URL to avoid memory leaks.
			if (this.url !== null) {
				window.URL.revokeObjectURL(this.url);
			}
			this.url = window.URL.createObjectURL(data);

	}
}
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
	.encrypt-download{
		padding-top:10px;
	}
	.icon-show{
		padding-left:20px;
		cursor: pointer;
	}
	.icon-hide{
		padding-left:20px;
		cursor: pointer;
	}

</style>