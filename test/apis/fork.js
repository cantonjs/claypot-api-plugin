
export default {
	'x-name': 'shit',
	'x-model': 'Fork',
	'/': {
		get: {
			'x-model': 'User',
			summary: 'Get users',
			params: {
				name: {
					in: 'query',
					description: 'Get user by name',
				},
				tags: {
					in: 'query',
					type: 'array',
					description: 'List of tag names',
					collectionFormat: 'pipes',
					maxItems: 5,
					minItems: 2,
					items: {
						type: 'string',
						minLength: 2,
						maxItems: 5,
						minItems: 2,
					},
				},
			},
			operator: 'hello',
		},
	},
};
