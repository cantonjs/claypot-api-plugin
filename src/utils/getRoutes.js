
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import convertURL from './convertURL';
import spec from '../spec';
import auth from '../auth';

function RouterMeta(config, name, path) {
	this._config = config;
	this._name = name;
	this._absolutePath = path;
	this.route = { path, metaData: [] };
};

httpMethodsWhiteList.forEach((method) => {
	RouterMeta.prototype[method] = function (path, pathSpec, ...middlewares) {
		path = ensureAbsolutePath(path);
		const fullPath = convertURL(this._absolutePath + path);
		this.route.metaData.push({
			fullPath,
			path,
			method,
			middlewares,
		});
		spec.addPath(this._name, fullPath, method, pathSpec);
		return this;
	};
});

export default function getRoutes(config = {}, claypotConfig) {
	const controllers = mapModules(config.controllersPath, claypotConfig.root);
	if (config.useDefaultAuthRoute) {
		controllers.push({ name: 'auth', module: auth });
	}
	const routes = [];
	controllers
		.forEach(({ name, module }) => {
			const absolutePath = ensureAbsolutePath(name);
			const routerMeta = new RouterMeta(config, name, absolutePath);
			module(routerMeta);
			routes.push(routerMeta.route);
		})
	;
	return routes;
}
