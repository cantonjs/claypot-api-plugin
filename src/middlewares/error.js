
import { isDev } from 'claypot';
import logger from '../utils/logger';

export default function error() {
	return async (ctx, next) => {
		const { url, method } = ctx.req;
		try {
			await next();
		}
		catch (err) {
			Object.assign(err, { url, method });
			logger.error(err);
			ctx.status = err.status || 400;
			ctx.body = {
				code: err.code || 1,
				message: err.message,
			};
			if (isDev) { ctx.body.stack = err.stack; }
		}
	};
}
