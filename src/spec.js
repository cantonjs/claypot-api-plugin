
import mapModules from './utils/mapModules';
import ensureAbsolutePath from './utils/ensureAbsolutePath';
import uniqLocations from './utils/uniqLocations';
import { convertToSwaggerPath } from './utils/convertPath';
import { forEach, isString, isObject } from 'lodash';
import { logger } from 'claypot';
import SwaggerParser from 'swagger-parser';
import { readJson } from 'fs-extra';
import { join } from 'path';
import fetch from 'node-fetch';
import { PARAM_VAR, REQUIRED_SEC } from './constants';

const setRefs = function setRefs(spec) {
	if (Array.isArray(spec)) {
		spec = spec.map(setRefs);
	}
	else if (isObject(spec)) {
		spec = Object.keys(spec).reduce((obj, key) => {
			obj[key] = setRefs(spec[key]);
			return obj;
		}, {});
	}
	else if (isString(spec) && spec.startsWith('$')) {
		const ref = spec.slice(1);
		return {
			'$ref': `#/definitions/${ref}`,
		};
	}

	return spec;
};

const ensureGet = (object = {}, key, Type = Object) => {
	const val = object[key];
	if (val) { return val; }
	else { return (object[key] = new Type()); }
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
		if (this._dereference) { return this._dereference; }
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
				if (!parameter) { parameter = {}; }
				if (isString(parameter)) { parameter = { in: parameter }; }
				parameter[PARAM_VAR] = name;
				if (!parameter.name) { parameter.name = name; }
				if (!parameter.in) { parameter.in = 'body'; }
				if (!parameter.type) { parameter.type = 'string'; }
				return parameter;
			});
		}

		return spec;
	}

	addParamsToPath(newSpec, distPath) {
		this.ensureParamsField(newSpec);
		const parameters = ensureGet(distPath, 'parameters', Array);
		parameters.push(
			...newSpec.parameters,
		);
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
		let { responses = {} } = spec;
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

	addPath(name, path, pathSpec, method) {
		const rootPath = ensureGet(this._paths, convertToSwaggerPath(path));
		this.ensureParamsField(pathSpec);
		this.uniqParams(pathSpec);
		this.ensureSecurityField(pathSpec);
		this.ensureResponseField(pathSpec);
		const spec = { tags: [name], ...pathSpec };
		if (method) { rootPath[method] = spec; }
		else { Object.assign(rootPath, spec); }
	}

	getPath(path, method) {
		path = convertToSwaggerPath(path);

		try {
			const required = REQUIRED_SEC;
			const rootDeref = this._dereference;
			const rootPathDeref = rootDeref.paths[path];
			const { parameters } = rootPathDeref;
			const pathDeref = rootPathDeref[method];

			if (parameters && parameters.length) {
				ensureGet(pathDeref, 'parameters', Array).push(...parameters);
				this.uniqParams(pathDeref);
			}

			if (!pathDeref.security) {
				pathDeref.security = rootPathDeref.security || rootDeref.security;
			}
			const { security } = pathDeref;
			if (security && security.length && !pathDeref[required]) {
				pathDeref[required] = rootPathDeref[required] || rootDeref[required];
			}

			return pathDeref;
		}
		catch (err) {
			logger.debug(err);
			return {};
		}
	}

	getDefaultSpec() {
		const config = this._config;
		const claypotConfig = this._claypotConfig;

		const info = {
			'version': '1.0.0',
			'title': `${claypotConfig.name} API`,
			...config.info,
		};

		const spec = {
			'swagger': '2.0',
			info,
			'basePath': ensureAbsolutePath(config.basePath),
			'consumes': config.consumes,
			'produces': config.produces,
			'schemes': ['http', claypotConfig.ssl.enable && 'https'].filter(Boolean),
			'paths': {},
			'securityDefinitions': {},
			'definitions': {},
		};

		if (config.defaultSecurity) {
			spec.security = config.defaultSecurity;
			this.ensureSecurityField(spec);
		}

		return spec;
	}

	getSecurityNames(security = []) {
		return security.map((o) => Object.keys(o)[0]);
	}

	getSecurityDefs() {
		if (this._securityDefs) { return this._securityDefs; }

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
			const hasExists = parameters.some((param) =>
				param.name === name && param.in === security.in
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
		if (this._json) { return this._json; }

		const config = this._config;
		const claypotConfig = this._claypotConfig;
		let spec = this.getDefaultSpec();

		const defs = mapModules(config.definitionsPath, claypotConfig.root);
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
