export default {
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
