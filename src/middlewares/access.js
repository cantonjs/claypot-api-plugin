import uniqLocations from '../utils/uniqLocations';
import { find } from 'lodash';

export default function accessMiddleware(
	securities,
	required = [],
	securityDefs,
) {
	const keysMap = new Map();
	for (const [name, def] of Object.entries(securityDefs)) {
		const keyStructs = [def.in, def.name, def.type];
		keysMap.set(name, keyStructs.join('_@_'));
	}
	const requiredMap = new Map();
	for (const security of required) {
		if (keysMap.has(security)) {
			const key = keysMap.get(security);
			if (requiredMap.has(key)) {
				const securitiesSet = requiredMap.get(key);
				securitiesSet.add(security);
			}
			else {
				requiredMap.set(key, new Set([security]));
			}
		}
	}

	const verifyRequired = (decodedSecurity) => {
		for (const securitiesSet of requiredMap.values()) {
			let matched = false;
			for (const { security } of decodedSecurity) {
				if (securitiesSet.has(security)) {
					matched = true;
					break;
				}
			}
			if (!matched) return false;
		}
		return true;
	};

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

			const decodedSecurity = await Promise.all(verifies);

			const isAllRequired = verifyRequired(decodedSecurity);

			if (!isAllRequired) {
				return ctx.throw(403);
			}

			ctx.clay.states = decodedSecurity.reduce(
				(states, { security, ...data }) => {
					states[security] = data;
					return states;
				},
				{},
			);
		}
		await next();
	};
}
