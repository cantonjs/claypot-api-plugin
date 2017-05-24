
import accessMiddleware from '../middlewares/access';
import validationMiddleware from '../middlewares/validation';
import paramsMiddleware from '../middlewares/params';
import { PARAM_VAR, REQUIRED_SEC } from '../constants';
import spec from '../spec';

export default function createRouteMiddlwawres(method, path) {
	const pathDeref = spec.getPath(path, method);
	const middlewares = [validationMiddleware(pathDeref)];

	const securityNames = spec.getSecurityNames(pathDeref.security);
	if (securityNames.length) {
		const securityDefs = spec.getSecurityDefs();
		const securities = securityNames.map((name) => ({
			...securityDefs[name],
			securityName: name,
		}));
		spec.addSecurityParameters(pathDeref, securities);
		middlewares.push(accessMiddleware(securities));
	}

	if (pathDeref.parameters) {
		const params = [];
		pathDeref.parameters.forEach((parameter) => {
			const { name, in: field } = parameter;
			const key = parameter[PARAM_VAR] || `${name}$${field}`;
			params.push({ key, field, name });
		});

		middlewares.push(paramsMiddleware(params));
	}

	return middlewares;
}
