import { RATELIMIT, RATELIMIT_DURATION } from '../constants';
import { cache } from 'claypot';
import ms from 'ms';

export default function ratelimieMiddleware(pathDeref, config) {
	const limit = pathDeref[RATELIMIT];
	const duration = pathDeref[RATELIMIT_DURATION] || config.ratelimit.duration;
	const ttl = ms(duration);
	return async (ctx, next) => {
		const { ip } = ctx;
		const key = `ratelimit:${ip}`;
		const state = (await cache.get(key)) || { start: Date.now() };
		const { count: prevCount = 0, start } = state;
		const count = 1 + prevCount;
		const ttlOption = prevCount ? { ttl } : {};
		Object.assign(state, { count });
		await cache.set(key, state, ttlOption);
		const remaining = limit - count;
		const resetDate = new Date(start + ttl).toISOString();
		if (remaining < 0) {
			const retry = ms(ttl + start - Date.now(), { long: true });
			ctx.throw(429, `Rate limit exceeded, retry in ${retry}.`);
		}
		ctx.set('X-RateLimit-Reset', resetDate);
		ctx.set('X-RateLimit-Limit', limit);
		ctx.set('X-RateLimit-Remaining', remaining);
		await next();
	};
}
