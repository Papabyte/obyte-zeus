exports.getArrDefinition = function(master_key_b64, production_key_b64){

	return 	['or',
		[['and',[ 
			[
				"sig",
				{
					"pubkey": production_key_b64
				}
			],
			[
				"not", ["has definition change", ["this address", "any"]]
			]
		]],
					
		[
			"sig",
			{
				"pubkey": master_key_b64
			}
		]
		]
				
	];

};

exports.prod_key_signing_path = "r.0.0";
exports.master_key_signing_path = "r.1";

exports.hub_testnet = "wss://obyte.org/bb-test";
exports.hub = "wss://obyte.org/bb";

exports.passphrase_length = 5;
exports.version = 1;