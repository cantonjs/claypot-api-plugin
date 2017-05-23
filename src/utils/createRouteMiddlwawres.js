
import accessMiddleware from '../middlewares/access';
import paramsMiddleware from '../middlewares/params';
import spec from '../spec';

export default function createRouteMiddlwawres(method, path, fullPath) {
	const middlewares = [];
	const derefPath = spec.getPath(fullPath, method);
	const securityNames = spec.getSecurityNames(derefPath.security);
	const securityDefs = spec.getSecurityDefs();

	if (securityNames.length) {
		const securities = securityNames.map((name) => securityDefs[name]);
		spec.addSecurityParameters(fullPath, method, securities);
		middlewares.unshift(accessMiddleware(securities));
	}

	if (derefPath.parameters) {
		const params = [];
		derefPath.parameters.forEach((parameter) => {
			const { _var, name, in: field } = parameter;
			const key = _var || `_${field}_${name}`;
			delete parameter._var;
			params.push({ key, field, name });
		});

		middlewares.push(paramsMiddleware(params));
	}

	// TODO
	// try {
	// 	console.log('derefPath', derefPath.parameters[0]);
	// }
	// catch (err) {}

	return middlewares;
}
