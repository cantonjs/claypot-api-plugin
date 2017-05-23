
export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			const accessToken = ctx.request.get('X-ACCESS-TOKEN');

			console.log('X-ACCESS-TOKEN', accessToken);
			ctx.throw(401, 'access_denied');
		}
		await next();
	};
}
