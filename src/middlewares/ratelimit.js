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
	const limit = +pathDeref[RATELIMIT];
	const scope = pathDeref[RATELIMIT_SCOPE];
	const cacheStore = storeKey ? cacheStores[storeKey] : cache;
	warnMemoryCache(cacheStore);
	const duration = pathDeref[RATELIMIT_DURATION] || defaultDuration;
	const durationMs = ms(duration);
	return async (ctx, next) => {
		const { ip } = ctx;
		const key = `${prefix}:${scope}:${ip}`;

		let state = await cacheStore.get(key);

		if (state && state.reset && state.reset < new Date().toISOString()) {
			state = null;
		}

		if (!state) {
			state = { reset: new Date(Date.now() + durationMs).toISOString() };
		}

		logger.debug(`ratelimit: scope="${scope}" ip="${ip}"`);

		const { reset } = state;
		const prevCount = +state.count || 0;
		const count = 1 + prevCount;
		Object.assign(state, { count });
		const ttl = new Date(reset).getTime() - Date.now();
		await cacheStore.set(key, state, { ttl });
		const remaining = limit - count;
		if (remaining < 0) {
			const retry = ms(ttl, { long: true });
			ctx.throw(429, `Rate limit exceeded, retry in ${retry}.`);
		}
		ctx.set('X-RateLimit-Reset', reset);
		ctx.set('X-RateLimit-Limit', limit);
		ctx.set('X-RateLimit-Remaining', remaining);
		await next();
	};
}
