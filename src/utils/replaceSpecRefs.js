
import { isObject, isString } from 'lodash';

const replaceSpecRefs = function replaceSpecRefs(spec) {
	if (Array.isArray(spec)) {
		spec = spec.map(replaceSpecRefs);
	}
	else if (isObject(spec)) {
		spec = Object.keys(spec).reduce((obj, key) => {
			obj[key] = replaceSpecRefs(spec[key]);
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

export default replaceSpecRefs;
