
import getParamValue from '../utils/getParamValue';
import { isNil } from 'lodash';

export default function validationMiddleware(pathDeref) {

	return async (ctx, next) => {
		const getValue = getParamValue(ctx);

		(pathDeref.parameters || []).forEach((param) => {
			const val = getValue(param.in, param.name);
			if (param.required && (isNil(val) || /^\s*$/.test(val))) {
				ctx.throw(405, `'${param.name}' in ${param.in} field is required.`);
			}
		});

		await next();
	};
}
