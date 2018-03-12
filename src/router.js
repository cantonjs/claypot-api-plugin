import { createApp } from 'claypot';
import Router from 'koa-router';
import createRouteMiddlwawres from './utils/createRouteMiddlwawres';
import clay from './middlewares/clay';
import error from './middlewares/error';
import body from './middlewares/body';
import jwt from './middlewares/jwt';

export default function router(routes, config) {
	const router = new Router();
	routes.forEach(({ path, method, ctrls }) => {
		const controllers = ctrls.map((ctrl) => async (ctx, next) => {
			const result = await ctrl.call(ctx.clay, ctx, next);
			if (result && !ctx.body) {
				ctx.body = result;
			}
			return result;
		});
		const middlewares = createRouteMiddlwawres(method, path, controllers);
		router[method](path, ...middlewares);
	});

	return createApp()
		.use(clay())
		.use(error())
		.use(body(config))
		.use(jwt(config))
		.use(router.middleware());
}
