
export default function operationMiddleware(model, operator) {
	return async (ctx) => {
		ctx.body = await ctx.clay.models[model][operator](
			ctx.clay.params,
			ctx,
		);
	};
}
