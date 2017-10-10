
import logger from '../utils/logger';

export default function operationMiddleware(modelName, operator) {
	return async (ctx) => {

		logger.trace(
			`handling "${ctx.originalUrl}" by model: ${modelName}.${operator}`
		);

		const model = ctx.clay.models[modelName];

		if (!model) {
			logger.error(`Model "${modelName}" not found`);
			return ctx.throw(500);
		}

		if (!model[operator]) {
			logger.error(`Operator "${operator}" not found in model "${modelName}"`);
			return ctx.throw(500);
		}

		ctx.body = await model[operator](
			ctx.clay.params,
			ctx,
		);
	};
}
