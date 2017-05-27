
export default {
	'/login': {
		post: {
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
			},
			async ctrl() {
				const { params, sign } = this;
				console.log('params', params);
				const accessToken = await sign(params.body);
				return accessToken;
			}
		}
	}
};
