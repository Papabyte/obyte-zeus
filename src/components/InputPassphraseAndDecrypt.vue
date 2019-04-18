<template>
	<div class="input-passphrase">
		<div v-for="index in objFromFile.passphrase_length" class="in-line" :key="index">
			<input type="text" v-model="arrWords[index-1]" placeholder="ex: acid" class="word in-line" :disabled="is_passphrase_complete">
			<div class="icon-valid-wrapper in-line">
				<img v-show="arrStatuses[index-1]" src="icon-valid.svg" height="20px">
			</div>
		</div>
	</div>

</template>

<script>

const dictionary = require('eff-diceware-passphrase/wordlist.json');
const crypto = require('crypto');

export default {
	name: 'InputPassphraseAndDecrypt',
	props: {
		objFromFile: {
			type: Object,
			required: true
		}
	},
	data: function(){
		return {
			arrWords: [],
			arrStatuses: [],
			is_passphrase_complete: false
		}
	},
	watch: {
		//total shares cannot be inferior to required shares
		arrWords: function () {	
			var count = 0;
			for (var i = 0; i < this.arrWords.length; i++){
				this.arrWords[i] = this.arrWords[i].trim();
				if (dictionary.indexOf(this.arrWords[i]) > -1){
					this.arrStatuses[i] = true;
					count++;
				} else{
					this.arrStatuses[i] = false;
				}
			}
			if (this.arrWords.length === count){
				this.decrypt();
				this.is_passphrase_complete = true;
			}
		}
	},
	methods: {
		//decrypt then emit event for parent component
		decrypt: function(){

			const sha256 = crypto.createHash('sha256');
			sha256.update(this.arrWords.join(" "));

			const input = new Buffer(this.objFromFile.encrypted_data, 'base64');
			const iv = input.slice(0, 16);
			const decipher = crypto.createDecipheriv('aes-256-ctr', sha256.digest(), iv);
			const decrypted_data = decipher.update(input.slice(16)) + decipher.final();
			this.$emit("decrypted", decrypted_data);

		}
	},
	created: function(){
		//we create arrays for words and their status
		for (var i = 0; i < this.objFromFile.passphrase_length; i++){
			this.arrStatuses[i] = false;
			this.arrWords[i] = "";
		}
	}
}
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
	.word{
	width:120px;
	margin-left:20px;
	}
	.icon-valid-wrapper{
		padding-left:5px;
		padding-top:5px;
		height:20px;
		width:25px;
	}

</style>