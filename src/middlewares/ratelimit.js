import { RATELIMIT, RATELIMIT_DURATION } from '../constants';
import { cache } from 'claypot';
import ms from 'ms';
import { isFunction } from 'lodash';

export default function ratelimieMiddleware(pathDeref, config) {
	const limit = pathDeref[RATELIMIT];
	const duration = pathDeref[RATELIMIT_DURATION] || config.ratelimit.duration;
	return async (ctx, next) => {
		const { ip } = ctx;
		const key = `ratelimit:${ip}`;
		const count = 1 + ((await cache.get(key)) || 0);
		await cache.set(key, count, {
			ttl: ms(duration),
		});
		if (isFunction(cache.ttl)) {
			console.log(await cache.ttl(key));
		}
		const remaining = limit - count;
		if (remaining < 0) {
			ctx.throw(429, 'Rate limit exceeded.');
		}
		ctx.set('X-RateLimit-Limit', limit);
		ctx.set('X-RateLimit-Remaining', remaining);
		await next();
	};
}
