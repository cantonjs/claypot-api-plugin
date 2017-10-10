
import getParamValue from '../utils/getParamValue';
import formatCollection from '../utils/formatCollection';
import { PARAM_VAR, COERCION } from '../constants';

export default function parserMiddleware(pathDeref) {
	return async (ctx, next) => {
		const getValue = getParamValue(ctx);
		const { parameters = [] } = pathDeref;
		const params = {};

		for (const spec of parameters) {
			let value = getValue(spec.in, spec.name);

			const { type, collectionFormat } = spec;

			if (type === 'array') {
				value = formatCollection(value, collectionFormat);
			}

			let name = spec[PARAM_VAR];

			if (name || !params.hasOwnProperty(spec.name)) {
				name = name || spec.name;
				params[name] = { spec, value, name };
			}
		}

		ctx.clay.__params = params;
		ctx.clay.__coercion = pathDeref[COERCION];

		await next();
	};
}
