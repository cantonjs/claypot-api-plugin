
import getParamValue from '../utils/getParamValue';
import { isUndefined } from 'lodash';

export default function paramsMiddleware(params) {
	return async (ctx, next) => {
		const getValue = getParamValue(ctx);
		ctx.clay.params = params.reduce((obj, { key, field, name }) => {
			const value = getValue(field, name);
			if (!isUndefined(value)) { obj[key] = value; }
			return obj;
		}, {});
		await next();
	};
}
