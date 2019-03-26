<template>
	<div id="load-file-decrypt" class="main-page">
		<div v-if="step == 'initial'">
			Open secret share file
			<LoadFile @load="onFileLoaded($event)" />
		</div>
		<div v-if="step == 'decrypt'">
			Enter passphrase for {{objFromFile.owner_name}}'s share
			<InputPassphraseAndDecrypt :objFromFile="objFromFile"  @decrypted="onShareDecrypted($event)"/>
		</div>

	</div>

</template>

<script>
import LoadFile from './LoadFile.vue'
import InputPassphraseAndDecrypt from './InputPassphraseAndDecrypt.vue'

export default {
	name: 'LoadFileAndDecrypt',
	components: {
		LoadFile,
		InputPassphraseAndDecrypt
	},
	props: {
		config: {
			type: Object
		}
	},
	data: function(){
		return {
			step: "initial",
			objFromFile: {}
		}
	},
	methods: {
		onFileLoaded: function(objFromFile){
			if (objFromFile.type == "share"){
				this.objFromFile = objFromFile;
				this.step = "decrypt";
			}
		},
		onShareDecrypted: function(decrypted_data){
			this.$emit("decrypted", decrypted_data);
		}
	},	
	created: function() {
			
	}
}
</script>

<style lang='scss'>
	@import '../assets/css/main.css';

	.next-action{

		padding-left: 5px;
		font-style:italic;
	}
</style>
