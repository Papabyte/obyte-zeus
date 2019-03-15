<template>
  <div id="configure" class="main-page">
	<HeadPage/>
	<div id="intro">
		<p>Obyte Zeus allows company executive managers to have full control over a witness or an oracle run by their company. While the
		public address of the node always stays the same, the private keys controlling it have a mechanism that limits the power of the
		key used for daily operation. It is then possible to take control back of an address that would have been compromized by an 
		attacker and avoid to have to fully trust people in charge of IT deployment.</p>
		
		<p>The executives generate with Obyte Zeus a master private key that is used to generate or revoke at any moment a weaker 
		key used in production.</p> 
		</div>
	<div id="drawing">
			<img src="drawing-zeus.svg" width="900px" class="logo">
	</div>
	<div id="what-action">
		<p>What would like to do?</p> 	
	</div>
	<LargeButton v-if="choice_1" :label= "choice_1" :onClick="onClick_1"/>
	<LargeButton v-if="choice_2" :label= "choice_2" :onClick="onClick_2"/>
	<LargeButton v-if="choice_3" :label= "choice_3" :onClick="onClick_3"/>
	</div>

</template>

<script>
import HeadPage from './components/HeadPage.vue'
import LargeButton from './components/LargeButton.vue'

export default {
	name: 'configure',
	components: {
		HeadPage,
		LargeButton
	},
	data:function(){
		return {
			step: null,
			choice_1: null,
			choice_2: null,
			choice_3: null,
			onClick_1: null,
			onClick_2: null,
			onClick_3: null,
			config: {}
		}
	},
	methods:{
		newStep: function(step){
			this.step = step;

			if (this.step == "initial"){
				this.choice_1 ="Generate or renew a master key";
				this.onClick_1 = ()=>{this.newStep("is_master_key_existing")};

				this.choice_2 = "Renew a production key";
				this.onClick_2 = ()=>{
					this.config.action = "renew_production_key";
					this.$router.push({name:'loadmasterkey', params:{config:this.config}});
				};

				this.choice_3 = null;
				this.onClick_3 = null;
			}

			if (this.step == "is_master_key_existing"){
				this.choice_1 ="Create a new set of keys";
				this.onClick_1 = ()=>{this.newStep("new_master_key")};

				this.choice_2 ="Renew an existing set of keys";
				this.onClick_2 = ()=>{
					this.config.action = "renew_set_of_keys";
					this.$router.push({name:'loadmasterkey', params:{config:this.config}});
				};

				this.choice_3 = "Return previous choice";
				this.onClick_3 = ()=>{this.newStep("initial")};
			}

			if (this.step == "new_master_key"){
				this.choice_1 ="Create a set of keys for a new address";
				this.onClick_1 = ()=>{
					this.config.action = "new_set_of_keys";
					this.config.is_existing_address = false;
					this.$router.push({name:'createmasterkey', params:{config:this.config}});
				};
				this.choice_2 ="Create a set of keys for an existing address";
				this.onClick_2 = ()=>{
					this.config.action = "new_set_of_keys";
					this.config.is_existing_address = true;
					this.$router.push({name: 'createmasterkey', params:{config:this.config}});
				};
				this.choice_3 = "Return previous choice";
				this.onClick_3 = ()=>{this.newStep("is_master_key_existing")};
			}

		}
	},	
	created: function() {
		this.newStep("initial");
	}
}
</script>

<style lang='scss'>
	@import './assets/css/main.css';
</style>
