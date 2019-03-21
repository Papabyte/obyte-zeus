<template>
	<div class="download-definition-change">
		To activate the new set of key, the following script is to be executed in the existing headless wallet directory: 
		<span class="icon-download" v-on:click="download" ><img src="icon-download.svg" height="20px"></span>
	</div>
</template>

<script>

const generatePassphrase = require('eff-diceware-passphrase')
const aes256 = require('aes256');

export default {
	name: 'CreateAndDownloadDefinitionChangeScript',
	props:  {
		address: {
			type: String,
			required: true
		},
		new_definition_chash: {
			type: String,
			required: true
		},
		onDownload:{
			type: Function,
			required: true
		}
	},
	data: function(){
		return {
		}
	},
	methods: {
		download: function(){
			const link = document.createElement('a')
			link.href = this.url;
			link.setAttribute('download','definition_change.js') //or any other extension
			document.body.appendChild(link)
			link.click()
			this.onDownload();
		}

	},
	created: function(){
		//script similar to https://github.com/byteball/headless-obyte/blob/master/play/create_definition_change.js
		//to be executed to change definition of an already existing address
		var definition_change_script = `
		"use strict";
		var headlessWallet = require('./start.js');
		var eventBus = require('ocore/event_bus.js');
		var objectHash = require('ocore/object_hash.js');

		function onError(err){
			throw Error(err);
		}

		function createDefinitionChange(){
			var composer = require('ocore/composer.js');
			var network = require('ocore/network.js');
			var callbacks = composer.getSavingCallbacks({
				ifNotEnoughFunds: onError,
				ifError: onError,
				ifOk: function(objJoint){
					network.broadcastJoint(objJoint);
				}
			});
			
			composer.composeDefinitionChangeJoint("`+ this.address +`", "`+ this.new_definition_chash + `", headlessWallet.signer, callbacks);
		}

		eventBus.on('headless_wallet_ready', createDefinitionChange);
		`;

		var data = new Blob([definition_change_script], {type: "application/json"});
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
	.download-definition-change{
		padding-top:80px;
		padding-bottom:20px;

	}
	.icon-download{
		padding-left:10px;
	}
</style>