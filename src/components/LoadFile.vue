<template>
  <label class="text-reader">
    <input v-if="!file_error" type="file" @change="loadJsonFromFile">
	<span v-else class="error">Error: invalid file <a class="ok" @click="file_error=false">OK</a></span>
  </label>
</template>

<script>
export default {
	data: function(){
		return {
			file_error : false
		}
	},
	methods: {
		loadJsonFromFile(ev) {
			const file = ev.target.files[0];
			const reader = new FileReader();

			reader.onload = (eventLoaded) => {
				try {
					console.log(eventLoaded.target.result);
					var	objFromFile = JSON.parse(eventLoaded.target.result);
					this.$emit("load", objFromFile);
				} catch {
					this.file_error = true;
				}
			}
			reader.readAsText(file);
		}
	}
};
</script>

<style lang='scss' scoped>
	@import '../assets/css/main.css';
	.error{
		color:red
	}
	.ok{
		color:red;
 		text-decoration: underline;
	}
	.ok:hover{
		cursor: pointer;
	}
</style>