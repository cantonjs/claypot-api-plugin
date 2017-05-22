
export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			const accessToken = ctx.request.get('X-ACCESS-TOKEN');
			console.log('accessToken', securities, accessToken);
		}
		await next();
	};
}
