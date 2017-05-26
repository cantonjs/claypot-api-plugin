
import getParamValue from '../utils/getParamValue';
import uniqLocations from '../utils/uniqLocations';

export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			const getToken = getParamValue(ctx);
			const verifies = uniqLocations(securities).map((security) => {
				const token = getToken(security.in, security.name);
				return token && ctx.clay.verify(token);
			}).filter(Boolean);

			ctx.clay.states = await Promise.all(verifies);
		}
		await next();
	};
}
