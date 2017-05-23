
import { logger, isDev } from 'claypot';

export default function error() {
	return async (ctx, next) => {
		try {
			await next();
		}
		catch (err) {
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
