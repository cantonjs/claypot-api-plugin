
import parserMiddleware from '../middlewares/parser';
import accessMiddleware from '../middlewares/access';
import operation from '../middlewares/operation';
import validationMiddleware from '../middlewares/validation';
import paramsMiddleware from '../middlewares/params';
import { PARAM_VAR, OPERATOR, MODEL } from '../constants';
import spec from '../spec';
import { differenceWith } from 'lodash';

export default function createRouteMiddlwawres(method, path, ctrls) {
	const pathDeref = spec.getPath(path, method);
	const middlewares = [
		parserMiddleware(pathDeref),
		validationMiddleware(pathDeref),
	];
	const paramToIgnores = [];

	const securityNames = spec.getSecurityNames(pathDeref.security);
	if (securityNames.length) {
		const securityDefs = spec.getSecurityDefs();
		const securities = securityNames.map((name) => ({
			...securityDefs[name],
			securityName: name,
		}));
		spec.addSecurityParameters(pathDeref, securities);
		middlewares.push(accessMiddleware(securities, paramToIgnores));
	}

	if (pathDeref.parameters) {
		const params = [];
		const keys = [];
		const parameters = differenceWith(
			pathDeref.parameters,
			paramToIgnores,
			(a, b) => a.in === b.in && a.name === b.name,
		);
		parameters.forEach((parameter) => {
			const { name, in: field } = parameter;
			let key = parameter[PARAM_VAR];
			if (!key && !keys.includes(name)) { key = name; }
			params.push({ key, field, name });
		});

		middlewares.push(paramsMiddleware(params));
	}

	middlewares.push(...ctrls);

	if (pathDeref[MODEL] && pathDeref[OPERATOR]) {
		middlewares.push(operation(pathDeref[MODEL], pathDeref[OPERATOR]));
	}

	return middlewares;
}
