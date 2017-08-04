
import logger from '../utils/logger';

export default function operationMiddleware(model, operator) {
	return async (ctx) => {

		logger.trace(
			`handling "${ctx.originalUrl}" by model: ${model}.${operator}`
		);

		ctx.body = await ctx.clay.models[model][operator](
			ctx.clay.params,
			ctx,
		);
	};
}
