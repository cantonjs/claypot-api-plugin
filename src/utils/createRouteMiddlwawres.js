import parserMiddleware from '../middlewares/parser';
import accessMiddleware from '../middlewares/access';
import operation from '../middlewares/operation';
import validationMiddleware from '../middlewares/validation';
import paramsMiddleware from '../middlewares/params';
import ratelimitMiddleware from '../middlewares/ratelimit';
import { PARAM_VAR, OPERATOR, MODEL, RATELIMIT } from '../constants';
import spec from '../swaggerSpec';
import { differenceWith } from 'lodash';
import logger from './logger';

export default function createRouteMiddlwawres(method, path, ctrls, config) {
	const pathDeref = spec.getPath(path, method);

	const middlewares = [
		parserMiddleware(pathDeref),
		validationMiddleware(pathDeref),
	];

	// FIXME: remove
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
