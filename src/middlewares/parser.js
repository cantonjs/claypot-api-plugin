import createParamGetter from '../utils/createParamGetter';
import formatCollection from '../utils/formatCollection';
import { PARAM_VAR } from '../constants';

export default function parserMiddleware(pathDeref, debugMessage) {
	return async (ctx, next) => {
		const { parameters = [] } = pathDeref;
		const getValue = createParamGetter(ctx, debugMessage);
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

		await next();
	};
}
