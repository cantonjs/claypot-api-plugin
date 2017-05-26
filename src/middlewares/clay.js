
export default function clayMiddleware() {
	return async (ctx, next) => {
		const clay = {
			ctx,
			next,
			states: [],
			header: ctx.header,
			throw: ctx.throw,
		};
		ctx.clay = {
			...ctx.clay,
			...clay,
		};
		await next();
		if (clay.body && !ctx.body) {
			ctx.body = clay.body;
		}
	};
}
