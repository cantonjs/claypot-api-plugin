
export default function users(router) {
	return router
		.post('/', {
			summary: 'Create a new user',
			parameters: [
				{
					in: 'body',
					name: 'body',
					description: 'Pet object that needs to be added to the store',
					required: true,
					schema: '$User',
				},
			],
			responses: {
				'405': {
					description: 'Invalid input'
				}
			},
		}, async (ctx) => {
			console.log('create user', ctx.request.body);
			ctx.body = { message: 'create user' };
		})
		.get('/', {
			summary: 'Get users',
			parameters: [
				{
					in: 'query',
					name: 'name',
					description: 'Get user by name',
				},
			],
			responses: {
				'200': {
					description: 'Success'
				}
			},
		}, async (ctx) => {
			ctx.body = {
				code: 200,
				message: 'get user',
			};
		})
		// .put('/', (ctx) => {
		// 	return {
		// 		name:
		// 	};
		// }, async (ctx) => {
		// 	ctx.body = {
		// 		code: 200,
		// 		message: 'get user',
		// 	};
		// })
	;
}
