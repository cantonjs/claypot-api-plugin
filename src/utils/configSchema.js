export default {
	properties: {
		basePath: {
			type: 'string',
			default: '/api',
		},
		docPath: {
			type: 'string',
			default: '/doc',
		},
		docAuth: {
			if: {
				type: 'object',
				properties: {
					name: {
						type: 'string',
					},
					pass: {
						type: 'string',
					},
				},
				required: ['name', 'pass'],
			},
			then: {
				properties: {
					enable: {
						default: true,
					},
				},
			},
			dependencies: {
				name: ['pass'],
				pass: ['name'],
			},
			oneOf: [
				{
					type: 'object',
					anyOf: [
						{
							properties: {
								enable: {
									const: true,
								},
								name: {
									type: 'string',
								},
								pass: {
									type: 'string',
								},
							},
							required: ['name', 'pass'],
						},
						{
							properties: {
								enable: {
									const: false,
								},
							},
						},
					],
				},
				{
					const: false,
				},
			],
			default: false,
		},
		controllersPath: {
			type: 'string',
			default: '/apis',
		},
		definitionsPath: {
			type: 'string',
			default: '/defs',
		},
		securities: {
			type: 'object',
			default: { defaults: 'X-ACCESS-TOKEN' },
		},
		defaultSecurity: {
			type: 'array',
		},
		consumes: {
			type: 'array',
			items: {
				type: 'string',
			},
			default: ['application/json', 'application/x-www-urlencoded'],
		},
		info: {
			type: 'object',
		},
		bodyParser: {
			type: 'object',
			default: {},
		},
		secret: {
			type: 'string',
		},
		coercion: {
			type: 'boolean',
			default: true,
		},
		pluralize: {
			type: 'boolean',
			default: true,
		},
		ratelimit: {
			type: 'object',
			properties: {
				store: {
					type: 'string',
				},
				limit: {
					type: 'number',
				},
				duration: {
					type: 'string',
					default: '1 hour',
				},
			},
			default: {},
		},
	},
};
