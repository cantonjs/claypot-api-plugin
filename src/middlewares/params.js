
import getParamValue from '../utils/getParamValue';

export default function paramsMiddleware(params) {
	return async (ctx, next) => {
		const getValue = getParamValue(ctx);
		ctx.clay.params = params.reduce((obj, { key, field, name }) => {
			obj[key] = getValue(field, name);
			return obj;
		}, {});
		await next();
	};
}
