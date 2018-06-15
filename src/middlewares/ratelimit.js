import { cacheStores, cache } from 'claypot';
import ms from 'ms';
import logger from '../utils/logger';
import { RATELIMIT, RATELIMIT_DURATION, RATELIMIT_SCOPE } from '../constants';

const warnMemoryCache = function warnMemoryCache(cache) {
	if (!warnMemoryCache.warned && cache.store && cache.store.name === 'memory') {
		warnMemoryCache.warned = true;
		logger.warn(
			'It is recommended to use `redis` cache store instead of `memory` in `ratelimit.store` config.',
		);
	}
};

export default function ratelimieMiddleware(pathDeref, config) {
	const { store: storeKey, prefix, duration: defaultDuration } = config;
	const limit = pathDeref[RATELIMIT];
	const scope = pathDeref[RATELIMIT_SCOPE];
	const cacheStore = storeKey ? cacheStores[storeKey] : cache;
	warnMemoryCache(cacheStore);
	const duration = pathDeref[RATELIMIT_DURATION] || defaultDuration;
	const ttl = ms(duration);
	return async (ctx, next) => {
		const { ip } = ctx;
		const key = `${prefix}:${scope}:${ip}`;
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
