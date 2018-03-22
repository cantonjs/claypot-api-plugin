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
							},
							password: {
								type: 'string',
							},
						},
						required: ['username', 'password'],
					},
				},
			},
			async ctrl() {
				const { params, sign } = this;
				const accessToken = await sign(params.body);
				return accessToken;
			},
		},
	},
};
