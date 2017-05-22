
import getDefaultSpec from './getDefaultSpec';
import getSecurities from './getSecurities';
import mapModules from './mapModules';
import SwaggerParser from 'swagger-parser';
import { isObject, isString } from 'lodash';
import { logger } from 'claypot';

const parser = new SwaggerParser();

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

export default async function getSpec(specPaths, config, claypotConfig) {
	let spec = getDefaultSpec(config, claypotConfig);

	const defs = mapModules(config.definitionsPath, claypotConfig.root);
	const builtInDefs = mapModules('../defs', __dirname);
	builtInDefs.concat(defs).forEach(({ name, module }) => {
		spec.definitions[name] = module;
	});
	spec.paths = specPaths;
	spec.securityDefinitions = getSecurities(config);
	spec = setRefs(spec);

	spec = await parser.parse(spec);
	// const ast = await parser.dereference(spec);

	// logger.debug('API ast', ast);
	// logger.trace('API paths', ast);

	return spec;
};
