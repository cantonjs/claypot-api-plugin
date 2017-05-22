
import Koa from 'koa';
import Router from 'koa-router';
import mount from 'koa-mount';
import bodyParser from 'koa-bodyparser';
import createRouteMiddlwawres from './utils/createRouteMiddlwawres';

const getBodyParserConfig = (bodyParserConfig = {}) => {
	const { consumes = [] } = bodyParserConfig;
	const enableTypes = [];
	if (consumes.includes('application/json')) {
		enableTypes.push('json');
	}
	if (consumes.includes('application/x-www-urlencoded')) {
		enableTypes.push('form');
	}
	return {
		enableTypes,
		...bodyParserConfig,
	};
};

export default function router(routes, fullSpec, config) {
	const app = new Koa();

	app.use(bodyParser(getBodyParserConfig(config.bodyParser)));

	routes.forEach(({ path, metaData }) => {
		const childApp = new Koa();
		const childRouter = new Router();
		metaData.forEach(({ method, pathname, middlewares, spec }) => {
			const routeMiddlewares = createRouteMiddlwawres(spec, fullSpec);
			childRouter[method](pathname, ...routeMiddlewares, ...middlewares);
		});
		childApp.use(childRouter.middleware());
		app.use(mount(path, childApp));
	});

	return app;
}
