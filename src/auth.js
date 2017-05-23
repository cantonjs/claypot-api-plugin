
export default function auth(router) {
	return router
		.post('/login', {
			summary: 'Login',
			security: [],
			params: {
				body: {
					schema: {
						type: 'object',
						properties: {
							username: {
								type: 'string',
								required: true,
							},
							password: {
								type: 'string',
								required: true,
							},
						}
					}
				}
			}
		}, async (ctx) => {
			const { params, sign } = ctx.clay;
			console.log('params', params);
			const accessToken = await sign(params.body);
			ctx.body = { accessToken };
		})
	;
}
