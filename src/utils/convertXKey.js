import { forEach } from 'lodash';
import {
	NAME,
	MODEL,
	OPERATOR,
	COERCION,
	RATELIMIT,
	RATELIMIT_DURATION,
} from '../constants';

export function convertXKey(key) {
	switch (key) {
		case 'name':
			return NAME;
		case 'model':
			return MODEL;
		case 'operator':
			return OPERATOR;
		case 'coercion':
			return COERCION;
		case 'ratelimit':
			return RATELIMIT;
		case 'ratelimit-duration':
			return RATELIMIT_DURATION;
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
