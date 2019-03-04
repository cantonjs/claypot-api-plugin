export default {
	'/required': {
		get: {
			security: ['*foo'],
			async ctrl(ctx) {
				const { states } = ctx.clay;
				const securityKeys = Object.keys(states);
				return { securityKeys, states, ok: true };
			},
		},
	},
	'/requiredmulti': {
		get: {
			security: ['*foo', '*bar'],
			async ctrl(ctx) {
				const { states } = ctx.clay;
				const securityKeys = Object.keys(states);
				return { securityKeys, states, ok: true };
			},
		},
	},
	'/': {
		get: {
			security: ['foo', 'bar'],
			async ctrl(ctx) {
				const { states } = ctx.clay;
				const securityKeys = Object.keys(states);
				return { securityKeys, states, ok: true };
			},
		},
	},
};
