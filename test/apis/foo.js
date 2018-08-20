export default {
	'x-ratelimit': -1,
	'/': {
		get: {
			'x-model': 'User',
			summary: 'Get users',
			params: {
				name: {
					in: 'query',
					description: 'Get user by name',
				},

				// tags: {
				// 	in: 'query',
				// 	type: 'array',
				// 	description: 'List of tag names',
				// 	collectionFormat: 'pipes',
				// 	maxItems: 5,
				// 	minItems: 2,
				// 	items: {
				// 		type: 'string',
				// 		minLength: 2,
				// 		maxItems: 5,
				// 		minItems: 2,
				// 	},
				// },
				page: {
					in: 'query',
					type: 'number',
					default: 1,
				},
			},
			operator: 'hello',
		},
	},
	'/defaults': {
		get: {
			params: {
				page: {
					in: 'query',
					type: 'number',
					default: 1,
				},
				tags: {
					in: 'query',
					type: 'array',
					items: {
						type: 'string',
					},
					default: [],
				},
			},
			operator: 'params',
		},
	},
	'/params/:foo': {
		post: {
			params: {
				foo: 'path',
				bar: 'query',
				baz: 'header',
				body: {
					schema: {
						type: 'object',
						properties: {
							qux: {
								type: 'string',
							},
						},
						required: ['qux'],
					},
				},
			},
			operator: 'params',
		},
	},
	'/required': {
		get: {
			params: {
				page: {
					in: 'foo',
					required: true,
				},
			},
			operator: 'params',
		},
	},
};
