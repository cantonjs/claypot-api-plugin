import { reduce } from 'lodash';
import isEmptyValue from '../utils/isEmptyValue';

export default function paramsMiddleware() {
	return async (ctx, next) => {
		ctx.clay.params = reduce(
			ctx.clay.__params,
			(params, { value, name }) => {
				if (!isEmptyValue(value)) {
					params[name] = value;
				}
				return params;
			},
			{},
		);
		await next();
	};
}
