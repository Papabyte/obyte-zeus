<template>
	<div class="encrypt-download">
		<div class="passphrase">
		{{encrypted_data}} - {{passphrase}}
		<span v-on:click="download">download hi</span>
		</div>
	 {{state.is_downloaded}}
	</div>
</template>

<script>

const generatePassphrase = require('eff-diceware-passphrase')
const aes256 = require('aes256');

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
			test: "initial"
		}
	},
	methods: {
		download: function(){
			this.test ="downloaded";
			this.state.is_downloaded = true;
			const link = document.createElement('a')
			link.href = this.url
			link.setAttribute('download', this.name + '-'+ this.keys_set_properties.address+'.share') //or any other extension
			document.body.appendChild(link)
			link.click()
			this.onDownload();
		}

	},
	created: function(){
		this.passphrase = generatePassphrase(5).join(" ");
		this.encrypted_data = aes256.encrypt(this.passphrase, this.data.toString('base64'));
		this.jsonString = JSON.stringify(Object.assign({type: this.type, encrypted_data: this.encrypted_data, owner_name: this.name}, this.keys_set_properties));
		console.log(this.jsonString);

			var data = new Blob([this.jsonString], {type: "application/json"});
			// If we are replacing a previously generated file we need to
			// manually revoke the object URL to avoid memory leaks.
			if (this.url !== null) {
				window.URL.revokeObjectURL(this.url);
			}
			this.url = window.URL.createObjectURL(data);
			// returns a URL you can use as a href

	}
}
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
</style>