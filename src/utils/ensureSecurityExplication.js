
import { isString } from 'lodash';

export default function ensureSecurityExplication(field) {
	if (field && Array.isArray(field.security)) {
		field.security.forEach((security, index) => {
			if (isString(security)) {
				field.security[index] = { [security]: [] };
			}
		});
	}
	return field;
}
