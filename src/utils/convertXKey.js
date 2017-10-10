
import { forEach } from 'lodash';
import { NAME, PARAM_VAR, MODEL, OPERATOR, COERCION } from '../constants';

export function convertXKey(key) {
	switch (key) {
		case 'name':
			return NAME;
		case 'model':
			return MODEL;
		case 'params':
			return PARAM_VAR;
		case 'operator':
			return OPERATOR;
		case 'coercion':
			return COERCION;
		default:
			return key;
	}
}

export function ensureSpec(spec = {}) {
	forEach(spec, (val, key) => {
		const convertedKey = convertXKey(key);
		if (key !== convertedKey) {
			spec[convertedKey] = val;
			Reflect.deleteProperty(spec, key);
		}
	});
	return spec;
}
