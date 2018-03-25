import Ajv from 'ajv';
import { isObject, forEach, omit } from 'lodash';
import { COERCION } from '../constants';

const omitParamSchemaKeys = ['required', 'name', 'in'];

export default function validationMiddleware(pathDeref) {
	const coerceTypes = pathDeref[COERCION];
	const validate = function validate(ajv, schema, value) {
		const isValid = ajv.validate(schema, value);
		if (!isValid) {
			const error = new Error(ajv.errorsText());
			error.errors = ajv.errors;
			throw error;
		}
	};
	return async (ctx, next) => {
		const { __params } = ctx.clay;
		const ajv = new Ajv({ coerceTypes });

		const paramsValue = {};
		const paramsSchemaProperties = {};
		const paramsSchemaRequired = [];

		forEach(__params, ({ value, spec }, key) => {
			if (spec.in === 'body') {
				if (isObject(spec.schema)) {
					validate(ajv, spec.schema, value);
				}
			}
			else {
				paramsValue[key] = value;
				if (spec.required) {
					paramsSchemaRequired.push(key);
				}
				paramsSchemaProperties[key] = omit(spec, omitParamSchemaKeys);
			}
		});

		validate(
			ajv,
			{
				type: 'object',
				properties: paramsSchemaProperties,
				required: paramsSchemaRequired,
			},
			paramsValue,
		);

		await next();
	};
}
