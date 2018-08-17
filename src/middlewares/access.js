import uniqLocations from '../utils/uniqLocations';
import { find } from 'lodash';

export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			const verifies = uniqLocations(securities)
				.map((security) => {
					const param = find(
						ctx.clay.__params,
						({ spec }) =>
							spec.in === security.in && spec.name === security.name,
					);

					// delete secerity param
					delete ctx.clay.__params[param.name];

					const accessToken = param.value;
					if (param.spec.required && !accessToken) ctx.throw(401);
					return accessToken;
				})
				.filter(Boolean)
				.map(async (accessToken) =>
					ctx.clay.verify(accessToken).catch((err) => {
						ctx.throw(401, undefined, { reason: err.message });
					}),
				);

			const decodes = await Promise.all(verifies);

			ctx.clay.states = decodes.reduce((states, { security, ...data }) => {
				states[security] = data;
				return states;
			}, {});
		}
		await next();
	};
}
