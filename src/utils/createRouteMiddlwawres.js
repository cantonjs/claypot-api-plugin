import parserMiddleware from '../middlewares/parser';
import accessMiddleware from '../middlewares/access';
import operation from '../middlewares/operation';
import validationMiddleware from '../middlewares/validation';
import paramsMiddleware from '../middlewares/params';
import ratelimitMiddleware from '../middlewares/ratelimit';
import spec from '../swaggerSpec';
import logger from './logger';
import {
	PARAM_VAR,
	OPERATOR,
	MODEL,
	RATELIMIT,
	REQUIRED_SEC,
} from '../constants';

export default function createRouteMiddlwawres(method, path, ctrls, config) {
	const pathDeref = spec.getPath(path, method);
	const debugMessage = `"${method.toUpperCase()} ${path}"`;

	const middlewares = [
		parserMiddleware(pathDeref, debugMessage),
		validationMiddleware(pathDeref),
	];

	const securityNames = spec.getSecurityNames(pathDeref.security);

	if (securityNames.length) {
		const securityDefs = spec.getSecurityDefs();
		const required = pathDeref[REQUIRED_SEC];
		const securities = securityNames.map((name) => ({
			...securityDefs[name],
			securityName: name,
		}));
		spec.addSecurityParameters(pathDeref, securities);
		middlewares.push(accessMiddleware(securities, required));
	}

	if (pathDeref.parameters) {
		const params = [];
		const keys = [];
		pathDeref.parameters.forEach((parameter) => {
			const { name, in: field } = parameter;
			let key = parameter[PARAM_VAR];
			if (!key && !keys.includes(name)) {
				key = name;
			}
			params.push({ key, field, name });
		});

		middlewares.push(paramsMiddleware(params));
	}

	if (pathDeref[RATELIMIT] > 0) {
		middlewares.push(ratelimitMiddleware(pathDeref, config.ratelimit));
	}

	const handlers = [...ctrls];

	if (pathDeref[MODEL] && pathDeref[OPERATOR]) {
		handlers.push(operation(pathDeref[MODEL], pathDeref[OPERATOR]));
	}

	const fullRoutePath = `${method.toUpperCase()} ${path}`;

	if (handlers.length) {
		logger.trace(`route "${fullRoutePath}" registered`);
		middlewares.push(...handlers);
	}
	else {
		logger.warn(
			`missing contorller or model operation on route "${fullRoutePath}"`,
		);
	}

	return middlewares;
}
