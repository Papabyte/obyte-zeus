exports.getArrDefinition = function(master_key_b64, production_key_b64){

	return 	['or',
		['and', 
			[
				"sig",
				{
					"pubkey": production_key_b64
				}
			],
			[
				"not", ["has definition change", ["this address", "any"]]
			],
		],
		[
			"sig",
			{
				"pubkey": master_key_b64
			}
		]
	];

};