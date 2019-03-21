import { isDev } from 'claypot';
import logger from '../utils/logger';

export default function error() {
	return async (ctx, next) => {
		const { originalUrl, method } = ctx.request;
		try {
			await next();
		}
		catch (err) {
			Object.assign(err, { url: originalUrl, method });
			const { stack } = err;
			if (typeof err === 'object') {
				Reflect.deleteProperty(err, 'stack');
			}
			logger.error(err);
			const { code = 1, message, status = 400 } = err;
			ctx.status = status;
			const body = { code, message };
			if (err.reason) body.reason = err.reason;
			if (isDev) body.stack = stack;
			ctx.body = body;
		}
	};
}
