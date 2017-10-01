
import Ajv from 'ajv';
import isEmptyValue from '../utils/isEmptyValue';
import { isObject, forEach } from 'lodash';

const ajv = new Ajv();

export default function validationMiddleware() {
	return async (ctx, next) => {
		forEach(ctx.clay.__params, ({ value, spec }) => {
			if (spec.required && isEmptyValue(value)) {
				ctx.throw(405, `'${spec.name}' in ${spec.in} field is required.`);
			}

			if (spec.in === 'body' && isObject(spec.schema)) {
				const isValid = ajv.validate(spec.schema, value);
				if (!isValid) {
					const error = new Error(ajv.errorsText());
					error.errors = ajv.errors;
					throw error;
				}
			}
		});

		await next();
	};
}
