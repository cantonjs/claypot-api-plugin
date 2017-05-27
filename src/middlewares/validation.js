
import tv4 from 'tv4';
import isEmptyValue from '../utils/isEmptyValue';
import { isObject, forEach } from 'lodash';

export default function validationMiddleware() {
	return async (ctx, next) => {
		forEach(ctx.clay.__params, ({ value, spec }) => {
			if (spec.required && isEmptyValue(value)) {
				ctx.throw(405, `'${spec.name}' in ${spec.in} field is required.`);
			}

			if (spec.in === 'body' && isObject(spec.schema)) {
				const isValid = tv4.validate(value, spec.schema);
				if (!isValid) { throw tv4.error; }
			}
		});

		await next();
	};
}
