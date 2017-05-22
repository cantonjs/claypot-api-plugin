
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import convertURL from './convertURL';
import spec from '../spec';

function RouterMeta(config, name, absolutePath) {
	this._config = config;
	this._name = name;
	this._absolutePath = absolutePath;
	this._childRoutes = [];
};

httpMethodsWhiteList.forEach((method) => {
	RouterMeta.prototype[method] = function (path, pathSpec, ...middlewares) {
		path = ensureAbsolutePath(path);
		const fullPath = convertURL(this._absolutePath + path);
		this._childRoutes.push({
			fullPath,
			path,
			method,
			middlewares,
		});
		spec.addPath(this._name, fullPath, method, pathSpec);
		return this;
	};
});

RouterMeta.prototype.__toObjects = function __toObjects() {
	return {
		route: {
			path: this._absolutePath,
			metaData: this._childRoutes,
		},
	};
};

export default function parse(config = {}, claypotConfig) {
	const controllers = mapModules(config.controllersPath, claypotConfig.root);
	const routes = [];
	controllers
		.forEach(({ name, module }) => {
			const absolutePath = ensureAbsolutePath(name);
			const routerMeta = new RouterMeta(config, name, absolutePath);
			module(routerMeta);
			const {
				route,
			} = routerMeta.__toObjects();
			routes.push(route);
		})
	;

	return { routes };
}
