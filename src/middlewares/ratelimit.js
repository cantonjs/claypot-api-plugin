import { cacheStores, cache } from 'claypot';
import ms from 'ms';
import logger from '../utils/logger';
import { RATELIMIT, RATELIMIT_DURATION } from '../constants';

export default function ratelimieMiddleware(pathDeref, config) {
	const limit = pathDeref[RATELIMIT];
	const { store: storeKey, prefix, duration: defaultDuration } = config;
	const cacheStore = storeKey ? cacheStores[storeKey] : cache;
	if (cacheStore.store && cacheStore.store.name === 'memory') {
		logger.warn(
			'Detected that you are using memory to store ratelimit state, it is recommend to use `redis` instead.',
		);
	}
	const duration = pathDeref[RATELIMIT_DURATION] || defaultDuration;
	const ttl = ms(duration);
	return async (ctx, next) => {
		const { ip } = ctx;
		const key = `${prefix}:${ip}`;
		const state = (await cacheStore.get(key)) || { start: Date.now() };
		const { count: prevCount = 0, start } = state;
		const count = 1 + prevCount;
		const ttlOption = prevCount ? { ttl } : {};
		Object.assign(state, { count });
		await cacheStore.set(key, state, ttlOption);
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
