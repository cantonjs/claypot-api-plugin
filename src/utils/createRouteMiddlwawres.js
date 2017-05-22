
import accessMiddleware from '../middlewares/access';

export default function createRouteMiddlwawres(spec, fullSpec) {
	const middlewares = [];
	const security = spec.security || fullSpec.security || [];
	const securities = security.map((o) => Object.keys(o)[0]);

	if (securities.length) { middlewares.push(accessMiddleware(securities)); }

	return middlewares;
}
