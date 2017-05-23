
// import spec from '../spec';

export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			console.log('securities', securities);
			const token = ctx.request.get('X-ACCESS-TOKEN');

			const { security, user } = await ctx.clay.verify(token);
			console.log('securityName', security);
			ctx.clay.user = user;
		}
		await next();
	};
}
