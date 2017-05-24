
export default function clayMiddleware() {
	return async (ctx, next) => {
		const clay = {
			ctx,
			next,
			throw: ctx.throw,
		};
		ctx.clay = ctx.claypot = clay;
		await next();
		if (clay.body && !ctx.body) {
			ctx.body = clay.body;
		}
	};
}
