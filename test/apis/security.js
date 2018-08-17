export default {
	'/required': {
		get: {
			security: ['*bar'],
			async ctrl(ctx) {
				const { states } = ctx.clay;
				const securityKeys = Object.keys(states);
				return { securityKeys, states, ok: true };
			},
		},
	},
	'/': {
		get: {
			security: ['bar'],
			async ctrl(ctx) {
				const { states } = ctx.clay;
				const securityKeys = Object.keys(states);
				return { securityKeys, states, ok: true };
			},
		},
	},
};
