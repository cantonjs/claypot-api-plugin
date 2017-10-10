
import { NAME, PARAM_VAR, MODEL, OPERATOR, COERCION } from '../constants';

export default function convertXKey(key) {
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
