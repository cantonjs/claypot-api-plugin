
import accessMiddleware from '../middlewares/access';
import spec from '../spec';

export default function createRouteMiddlwawres(method, path, fullPath) {
	const middlewares = [];
	const derefPath = spec.getPath(fullPath, method);
	const securityNames = spec.getSecurityNames(derefPath.security);

	if (securityNames.length) {
		middlewares.push(accessMiddleware(securityNames));
	}

	return middlewares;
}
