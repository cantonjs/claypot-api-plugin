import mapModules from './utils/mapModules';
import ensureAbsolutePath from './utils/ensureAbsolutePath';
import uniqLocations from './utils/uniqLocations';
import capitalize from './utils/capitalize';
import { convertToSwaggerPath } from './utils/convertPath';
import logger from './utils/logger';
import { forEach, isString, isObject } from 'lodash';
import SwaggerParser from 'swagger-parser';
import { readJson } from 'fs-extra';
import { join } from 'path';
import fetch from 'node-fetch';
import ms from 'ms';
import {
	NAME,
	PARAM_VAR,
	REQUIRED_SEC,
	MODEL,
	OPERATOR,
	COERCION,
	RATELIMIT,
	RATELIMIT_DURATION,
	RATELIMIT_SCOPE,
} from './constants';

const setRefs = function setRefs(spec) {
	if (Array.isArray(spec)) {
		spec = spec.map(setRefs);
	}
	else if (spec && isObject(spec) && !(spec instanceof Date)) {
		spec = Object.keys(spec).reduce((obj, key) => {
			obj[key] = setRefs(spec[key]);
			return obj;
		}, {});
	}
	else if (isString(spec) && spec.startsWith('$')) {
		const ref = spec.slice(1);
		return {
			$ref: `#/definitions/${ref}`,
		};
	}

	return spec;
};

const ensureGet = (object = {}, key, Type = Object) => {
	const val = object[key];
	if (val) {
		return val;
	}
	else {
		return (object[key] = new Type());
	}
};

class Spec {
	async init(config, claypotConfig) {
		this._config = config;
		this._claypotConfig = claypotConfig;
		this._paths = {};
		this._json = null;
		this._securityDefs = null;
		this._dereference = null;
		this.securityNames = [];
		await this.readSpecFile();
	}

	async readSpecFile() {
		const { spec } = this._config;
		if (isString(spec)) {
			try {
				if (/^https?:\/\//i.test(spec)) {
					const res = await fetch(spec);
					this._json = await res.json();
				}
				else {
					const { root } = this._claypotConfig;
					this._json = await readJson(join(root, spec));
				}
			}
			catch (err) {
				logger.error(`Failed to read spec file: "${spec}"`);
			}
		}
		else if (isObject(spec)) {
			this._json = spec;
		}
	}

	async genDereferenceAsync() {
		if (this._dereference) {
			return this._dereference;
		}
		this._dereference = await new SwaggerParser().dereference(this.toJSON());
		return this._dereference;
	}

	uniqParams(spec) {
		spec.parameters = uniqLocations(spec.parameters);
	}

	ensureParamsField(spec) {
		if (spec.params || spec.param) {
			spec.parameters = spec.params || spec.param;
			delete spec.params;
			delete spec.param;
		}

		const { parameters } = spec;

		if (!Array.isArray(parameters) && isObject(parameters)) {
			spec.parameters = Object.keys(parameters).map((name) => {
				let parameter = parameters[name];
				if (!parameter) {
					parameter = {};
				}
				if (isString(parameter)) {
					parameter = { in: parameter };
				}
				parameter[PARAM_VAR] = name;
				if (!parameter.name) {
					parameter.name = name;
				}
				if (!parameter.in) {
					parameter.in = 'body';
				}
				if (!parameter.type && !parameter.schema) {
					parameter.type = 'string';
				}
				return parameter;
			});
		}

		return spec;
	}

	ensureSecurityField(spec) {
		const convertRequiredSecurity = (sec) => {
			const name = Object.keys(sec)[0];
			if (name && name.charAt(0) === '*') {
				const requiredSecurity = ensureGet(spec, REQUIRED_SEC, Array);
				const realName = name.slice(1);
				requiredSecurity.push(realName);
				return { [realName]: sec[name] };
			}
			return sec;
		};

		if (spec && Array.isArray(spec.security)) {
			const { security } = spec;
			security.forEach((sec, index) => {
				if (isString(sec)) {
					security[index] = { [sec]: [] };
				}
				security[index] = convertRequiredSecurity(security[index]);
			});
		}
		return spec;
	}

	addSecurityToPath(newSpec, distPath) {
		this.ensureSecurityField(newSpec);
		const security = ensureGet(distPath, 'security');
		Object.assign(security, newSpec);
	}

	ensureResponseField(spec) {
		const duration =
			spec[RATELIMIT_DURATION] || this._config.ratelimit.duration;
		const ensureRateLimitHeaders = function ensureRateLimitHeaders(res) {
			const per = ms(ms(duration), { long: true }).replace(/^1 /, '');
			const { headers } = res;
			if (!headers['X-RateLimit-Limit']) {
				headers['X-RateLimit-Limit'] = {
					schema: { type: 'integer' },
					description: `Requests limit (${spec[RATELIMIT]} per ${per})`,
				};
			}
			if (!headers['X-RateLimit-Remaining']) {
				headers['X-RateLimit-Remaining'] = {
					schema: { type: 'integer' },
					description: 'The number of requests left for the time window',
				};
			}
			if (!headers['X-RateLimit-Reset']) {
				headers['X-RateLimit-Reset'] = {
					schema: { type: 'string', format: 'date-time' },
					description:
						'The UTC date/time at which the current rate limit window',
				};
			}
		};

		let { responses = {} } = spec;

		const okResponse = responses[200] || {};
		okResponse.description = okResponse.description || 'OK';
		okResponse.headers = okResponse.headers || {};
		if (spec[RATELIMIT] > 0) {
			ensureRateLimitHeaders(okResponse);
		}
		responses[200] = okResponse;

		const schema = {
			$ref: '#/definitions/DefaultErrorResponse',
		};
		if (!responses[400]) {
			responses[400] = {
				description: 'Payload Error',
				schema,
			};
		}

		// TODO: should only inject 401 when Security is required
		if (!responses[401]) {
			responses[401] = {
				description: 'Access Denied',
				schema,
			};
		}

		spec.responses = responses;
		return spec;
	}

	ensureXNameField(pathSpec, name) {
		if (!pathSpec[NAME]) {
			pathSpec[NAME] = capitalize(name);
		}
		return pathSpec[NAME];
	}

	ensureXCoercionField(pathSpec) {
		if (pathSpec.coercion !== undefined) {
			if (pathSpec[COERCION] === undefined) {
				pathSpec[COERCION] = pathSpec.coercion;
			}
			Reflect.deleteProperty(pathSpec, 'coercion');
		}
	}

	ensureXRatelimitField(pathSpec) {
		if (pathSpec.ratelimit !== undefined) {
			if (pathSpec[RATELIMIT] === undefined) {
				pathSpec[RATELIMIT] = pathSpec.ratelimit;
			}
			Reflect.deleteProperty(pathSpec, 'ratelimit');
		}
		if (pathSpec.ratelimitDuration !== undefined) {
			if (pathSpec[RATELIMIT_DURATION] === undefined) {
				pathSpec[RATELIMIT_DURATION] = pathSpec.ratelimitDuration;
			}
			Reflect.deleteProperty(pathSpec, 'ratelimitDuration');
		}

		const { ratelimit } = this._config;
		if (pathSpec[RATELIMIT] > 0 && !pathSpec[RATELIMIT_SCOPE]) {
			pathSpec[RATELIMIT_SCOPE] = pathSpec[NAME];
		}
		if (ratelimit.limit > 0) {
			if (pathSpec[RATELIMIT] === undefined) {
				pathSpec[RATELIMIT] = ratelimit.limit;
			}
			if (pathSpec[RATELIMIT] === undefined) {
				pathSpec[RATELIMIT_DURATION] = ratelimit.duration;
			}
			if (pathSpec[RATELIMIT_SCOPE] === undefined) {
				pathSpec[RATELIMIT_SCOPE] = ratelimit.scope;
			}
		}
	}

	ensureXModelField(pathSpec) {
		if (!pathSpec[MODEL] && pathSpec[NAME]) {
			pathSpec[MODEL] = pathSpec.model || pathSpec[NAME];
			Reflect.deleteProperty(pathSpec, 'model');
		}
	}

	ensureXOperatorField(pathSpec) {
		if (pathSpec.operator) {
			if (!pathSpec[OPERATOR]) {
				pathSpec[OPERATOR] = pathSpec.operator;
			}
			delete pathSpec.operator;
		}
	}

	genRootPathSpec(name, path, pathSpec) {
		const rootPath = ensureGet(this._paths, convertToSwaggerPath(path));
		const xName = this.ensureXNameField(pathSpec, name);
		this.ensureParamsField(pathSpec);
		this.uniqParams(pathSpec);
		this.ensureSecurityField(pathSpec);
		this.ensureXModelField(pathSpec);
		this.ensureXCoercionField(pathSpec);
		this.ensureXRatelimitField(pathSpec);
		this.ensureResponseField(pathSpec);
		const spec = { tags: [xName], ...pathSpec };
		return { spec, rootPath };
	}

	addPath(...args) {
		const { spec, rootPath } = this.genRootPathSpec(...args);
		Object.assign(rootPath, spec);
		return spec;
	}

	addPathMethod(method, ...args) {
		const { spec, rootPath } = this.genRootPathSpec(...args);
		rootPath[method] = spec;
		this.ensureXOperatorField(spec);
		return spec;
	}

	getPath(path, method) {
		path = convertToSwaggerPath(path);

		try {
			const rootDeref = this._dereference;
			const rootPathDeref = rootDeref.paths[path];
			const pathDeref = rootPathDeref[method];

			// ensure parameters
			const { parameters } = rootPathDeref;
			if (parameters && parameters.length) {
				ensureGet(pathDeref, 'parameters', Array).push(...parameters);
				this.uniqParams(pathDeref);
			}

			// ensure coercion
			if (!pathDeref[COERCION]) {
				pathDeref[COERCION] = rootPathDeref[COERCION] || this._config.coercion;
			}

			// ensure security
			if (!pathDeref.security) {
				pathDeref.security = rootPathDeref.security || rootDeref.security;
			}

			// ensure required security
			const requiredSec = REQUIRED_SEC;
			const { security } = pathDeref;
			if (security && security.length && !pathDeref[requiredSec]) {
				const rSec = rootPathDeref[requiredSec] || rootDeref[requiredSec];
				pathDeref[requiredSec] = rSec;
			}

			return pathDeref;
		}
		catch (err) {
			logger.debug(err);
			return {};
		}
	}

	getDefaultSpec() {
		const {
			basePath,
			apiInfo,
			consumes,
			produces,
			schemas,
			defaultSecurity,
		} = this._config;
		const claypotConfig = this._claypotConfig;

		const info = {
			version: '1.0.0',
			title: `${claypotConfig.name} API`,
			...apiInfo,
		};

		const spec = {
			swagger: '2.0',
			info,
			basePath: ensureAbsolutePath(basePath),
			consumes,
			produces,
			schemes:
				schemas ||
				['http', claypotConfig.ssl.enable && 'https'].filter(Boolean),
			paths: {},
			securityDefinitions: {},
			definitions: {},
		};

		if (defaultSecurity) {
			spec.security = defaultSecurity;
			this.ensureSecurityField(spec);
		}

		return spec;
	}

	getSecurityNames(security = []) {
		return security.map((o) => Object.keys(o)[0]);
	}

	getSecurityDefs() {
		if (this._securityDefs) {
			return this._securityDefs;
		}

		const { securities } = this._config;
		forEach(securities, (name, key) => {
			if (isString(name)) {
				securities[key] = {
					type: 'apiKey',
					in: 'header',
					description: 'Access token',
					name,
				};
			}
		});
		return (this._securityDefs = securities);
	}

	addSecurityParameters(pathDeref, securities) {
		const { parameters = [] } = pathDeref;
		const requiredSecurity = pathDeref[REQUIRED_SEC] || [];
		securities.forEach((security) => {
			const { name, description } = security;
			const hasExists = parameters.some(
				(param) => param.name === name && param.in === security.in,
			);
			if (!hasExists) {
				parameters.push({
					name,
					in: security.in,
					type: 'string',
					description,
					required: requiredSecurity.includes(security.securityName),
				});
			}
		});
	}

	toJSON() {
		if (this._json) {
			return this._json;
		}

		const config = this._config;
		const claypotConfig = this._claypotConfig;
		let spec = this.getDefaultSpec();

		const defs = mapModules(config.definitionsPath, claypotConfig.baseDir);
		const builtInDefs = mapModules('defs', __dirname);
		builtInDefs.concat(defs).forEach(({ name, module }) => {
			spec.definitions[name] = module;
		});
		spec.paths = this._paths;
		spec.securityDefinitions = this.getSecurityDefs(config);
		this.securityNames = Object.keys(spec.securityDefinitions);
		spec = setRefs(spec);

		return (this._json = spec);
	}

	alloc() {
		this._dereference = null;
		this._paths = {};
		this._securityDefs = null;
		this._config = {};
		this._claypotConfig = {};
	}
}

export default new Spec();
