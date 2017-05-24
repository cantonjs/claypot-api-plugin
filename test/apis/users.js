
export default {
	'/': {
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
				console.log('this.params', this.params);
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
			},
			async controller() {
				console.log('this.params', this.params);
				return {
					code: 200,
					message: 'get user',
				};
			},
		},
	},
	'/:id': {
		delete: {
			summary: 'Delete a user by id',
			security: ['admin'],
			params: {
				id: {
					in: 'path',
					required: true,
				},
				token: {
					name: 'X-ACCESS-TOKEN',
					in: 'header',
					type: 'string',
					required: true,
				},
			},
			async controller() {
				return { ok: `deleted user ${this.params.id}` };
			},
		},
	}
};

// export default function users(router) {
// 	return {
// 		'/': {
// 			get: {
// 				summary: 'Create a new user',
// 				security: ['defaults'],
// 				params: {
// 					body: {
// 						in: 'body',
// 						description: 'Pet object that needs to be added to the store',
// 						required: true,
// 						schema: '$User',
// 					}
// 				},
// 				responses: {
// 					'200': {
// 						schema: '$User',
// 					}
// 				},
// 			}
// 		}
// 	}

// 	return router
// 		.post('/', {
// 			summary: 'Create a new user',
// 			security: ['defaults'],
// 			params: {
// 				body: {
// 					in: 'body',
// 					description: 'Pet object that needs to be added to the store',
// 					required: true,
// 					schema: '$User',
// 				}
// 			},
// 			responses: {
// 				'200': {
// 					schema: '$User',
// 				}
// 			},
// 		}, async (ctx) => {
// 			console.log('ctx.$params', ctx.$params);
// 			ctx.body = { message: 'create user' };
// 		})
// 		.get('/', {
// 			summary: 'Get users',
// 			params: {
// 				name: {
// 					in: 'query',
// 					description: 'Get user by name',
// 				},
// 			},
// 		}, async (ctx) => {
// 			console.log('ctx.$params', ctx.$params);
// 			ctx.body = {
// 				code: 200,
// 				message: 'get user',
// 			};
// 		})
// 		.delete('/:id', {
// 			summary: 'Delete a user by id',
// 			security: ['admin'],
// 			params: {
// 				id: {
// 					in: 'path',
// 					required: true,
// 				},
// 				token: {
// 					name: 'X-ACCESS-TOKEN',
// 					in: 'header',
// 					type: 'string',
// 					required: true,
// 				},
// 			},
// 		}, async (ctx) => {
// 			ctx.body = { ok: `deleted user ${ctx.params.id}` };
// 		})
// 	;
// }
