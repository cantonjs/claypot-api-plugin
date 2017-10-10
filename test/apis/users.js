
export default {
	'x-model': 'Test',
	'/': {
		params: [
			{
				name: 'fork',
				in: 'header',
				'x-var': 'fork',
			}
		],
		post: {
			summary: 'Create a new user',
			security: ['defaults'],
			params: {
				body: {
					in: 'body',
					description: 'Pet object that needs to be added to the store',
					required: true,
					schema: '$User',
				}
			},
			responses: {
				'200': {
					schema: '$User',
				}
			},
			async controller() {
				return { message: 'create user' };
			},
		},
		get: {
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
			// model: 'Test',
			operator: 'hello',
			// async controller() {
			// 	// console.log('this.params', this.params);
			// 	return {
			// 		code: 200,
			// 		message: 'get user',
			// 	};
			// },
		},
	},
	'/:id': {
		delete: {
			summary: 'Delete a user by id',
			security: ['*admin'],
			params: {
				id: {
					in: 'path',
					required: true,
				},
			},
			async controller() {
				return { ok: `deleted user ${this.params.id}` };
			},
		},
	}
};
