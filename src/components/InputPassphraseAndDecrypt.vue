<template>
	<div class="input-passphrase">
		<div v-for="index in objFromFile.passphrase_length" class="in-line">
			<input type="text" v-model="arrWords[index-1]" placeholder="ex: acid" class="word">
		</div>
			<div v-if="is_passphrase_complete">
		is_passphrase_complete
	</div>
	</div>

</template>

<script>

const dictionary = require('eff-diceware-passphrase/wordlist.json');
const aes256 = require('aes256');

export default {
	name: 'InputPassphraseAndDecrypt',
	props:  {
		objFromFile: {
			type: Object,
			required: true
		}
	},
	data: function(){
		return {
			arrWords: [],
			is_passphrase_complete: false
		}
	},
	watch:{
		//total shares cannot be inferior to required shares
		arrWords: function (value) {	
			console.log("watch");
			for (var i = 0; i < this.arrWords.length; i++){
				console.log(this.arrWords[i]);
				if (dictionary.indexOf(this.arrWords[i]) == -1)
					return this.is_passphrase_complete = false;
			}
			return this.is_passphrase_complete = true;
		}
	},
	methods: {


	},
	created: function(){
	

	}
}
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
	.word{
	width:120px;
	margin-left:20px;
	}

</style>