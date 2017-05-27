
// import getParamValue from '../utils/getParamValue';
import uniqLocations from '../utils/uniqLocations';
import { find } from 'lodash';

export default function accessMiddleware(securities) {
	// if (securities.length) {
	// 	securities = uniqLocations(securities).map((security) => {
	// 		paramToIgnores.push(security);
	// 		return security;
	// 	});
	// }

	return async (ctx, next) => {
		if (securities.length) {

			const verifies = uniqLocations(securities).map((security) => {
				const param = find(ctx.clay.__params, ({ spec }) =>
					spec.in === security.in && spec.name === security.name
				);

				// delete secerity param
				delete ctx.clay.__params[param.name];

				const token = param.value;
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
