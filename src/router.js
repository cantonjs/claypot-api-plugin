
import Koa from 'koa';
import Router from 'koa-router';
import mount from 'koa-mount';
import createRouteMiddlwawres from './utils/createRouteMiddlwawres';
import error from './middlewares/error';
import body from './middlewares/body';
import jwt from './middlewares/jwt';

export default function router(routes, config) {
	const app = new Koa();

	app
		.use(error())
		.use(body(config))
		.use(jwt(config))
	;

	routes.forEach(({ path, metaData }) => {
		const childApp = new Koa();
		const childRouter = new Router();
		metaData.forEach(({ method, path, middlewares, fullPath }) => {
			const routeMiddlewares = createRouteMiddlwawres(method, path, fullPath);
			childRouter[method](path, ...routeMiddlewares, ...middlewares);
		});
		childApp.use(childRouter.middleware());
		app.use(mount(path, childApp));
	});

	return app;
}
