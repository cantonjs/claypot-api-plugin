
import getParamValue from '../utils/getParamValue';
import uniqLocations from '../utils/uniqLocations';

export default function accessMiddleware(securities, paramToIgnores) {
	if (securities.length) {
		securities = uniqLocations(securities).map((security) => {
			paramToIgnores.push(security);
			return security;
		});
	}

	return async (ctx, next) => {
		if (securities.length) {
			const getToken = getParamValue(ctx);
			const verifies = securities.map((security) => {
				const token = getToken(security.in, security.name);
				return token && ctx.clay.verify(token);
			}).filter(Boolean);

			const decodes = await Promise.all(verifies);

			ctx.clay.states = decodes.reduce((states, { security, ...data }) => {
				states[security] = data;
				return states;
			}, {});
		}
		await next();
	};
}
