
import Koa from 'koa';
import Router from 'koa-router';
import createRouteMiddlwawres from './utils/createRouteMiddlwawres';
import error from './middlewares/error';
import body from './middlewares/body';
import jwt from './middlewares/jwt';

export default function router(routes, config) {
	const router = new Router();
	routes.forEach(({ path, method, ctrls }) => {
		const middlewares = createRouteMiddlwawres(method, path);
		const controllers = ctrls.map((ctrl) => async (ctx, next) => {
			const result = await ctrl.call(ctx.clay, ctx, next);
			if (result && !ctx.body) { ctx.body = result; }
			return result;
		});
		router[method](path, ...middlewares, ...controllers);
	});

	return new Koa()
		.use(error())
		.use(body(config))
		.use(jwt(config))
		.use(router.middleware())
	;
}
