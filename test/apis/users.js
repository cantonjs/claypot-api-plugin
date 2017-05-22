
// const { post, desc } = global;

// @post('/', {
// 	summary: 'Create a new user',
// 	security: ['+admin'],
// })
// export class create {

// 	@desc({
// 		description: 'User object that needs to be added to the store',
// 		required: true,
// 	})
// 	user = this.$body.user;

// 	@desc({
// 		description: 'Access token',
// 		required: true,
// 	})
// 	accessToken = this.$header['X-ACCESS-TOKEN'];

// 	async $apply(ctx) {
// 		return this.user;
// 	}
// }

export default function users(router) {
	return router
		.post('/', {
			summary: 'Create a new user',
			security: ['defaults'],
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
				'200': {
					schema: '$User',
				}
			},
		}, async (ctx) => {
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
		}, async (ctx) => {
			ctx.body = {
				code: 200,
				message: 'get user',
			};
		})
		.delete('/:id', {
			summary: 'Delete a user by id',
			security: ['admin'],
			parameters: [
				{
					name: 'id',
					in: 'path',
					required: true,
				},
				{
					name: 'X-ACCESS-TOKEN',
					in: 'header',
					type: 'string',
					required: true,
				},
			],
		}, async (ctx) => {
			ctx.body = { ok: `deleted user ${ctx.params.id}` };
		})
	;
}
