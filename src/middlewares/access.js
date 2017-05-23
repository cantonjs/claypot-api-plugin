
import jwt from 'jsonwebtoken';

export default function accessMiddleware(securities) {
	return async (ctx, next) => {
		if (securities.length) {
			console.log('securities', securities);
			const token = ctx.request.get('X-ACCESS-TOKEN');

			const user = jwt.verify(token, 'fork');

			ctx.clay.user = user;

			// console.log('X-ACCESS-TOKEN', token);
			// ctx.throw(401, 'access_denied');
		}
		await next();
	};
}
