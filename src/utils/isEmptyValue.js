
import { isNil, isString } from 'lodash';

export default function isEmptyValue(value) {
	return isNil(value) || (isString(value) && !value.trim());
}
