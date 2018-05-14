import Ajv from 'ajv';
import { isObject, forEach, omit } from 'lodash';
import { COERCION } from '../constants';

const omitParamSchemaKeys = ['required', 'name', 'in'];

export default function validationMiddleware(pathDeref) {
	const coerceTypes = pathDeref[COERCION];

	return async (ctx, next) => {
		const { __params } = ctx.clay;
		const ajv = new Ajv({ coerceTypes });

		const paramsValue = {};
		const properties = {};
		const required = [];

		const validate = function validate(schema, value) {
			const isValid = ajv.validate(schema, value);
			if (!isValid) {
				const error = new Error(ajv.errorsText());
				error.errors = ajv.errors;
				throw error;
			}
		};

		forEach(__params, ({ value, spec, name }) => {
			if (spec.in !== 'body') {
				paramsValue[name] = value;
				if (spec.required) {
					required.push(name);
				}
				properties[name] = omit(spec, omitParamSchemaKeys);
			}
			else if (isObject(spec.schema)) {
				validate(spec.schema, value);
				paramsValue.body = value;
			}
		});

		validate({ type: 'object', properties, required }, paramsValue);

		forEach(paramsValue, (value, name) => (__params[name].value = value));

		await next();
	};
}
