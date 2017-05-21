
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';

function RouterMeta(config, name, absolutePath) {
	this._config = config;
	this._name = name;
	this._absolutePath = absolutePath;
	this._spec = {};
	this._childRoutes = [];
};

httpMethodsWhiteList.forEach((method) => {
	RouterMeta.prototype[method] = function (pathname, spec, ...middlewares) {
		this._childRoutes.push({
			pathname: ensureAbsolutePath(pathname),
			method,
			middlewares,
		});
		this._spec[method] = {
			tags: [this._name],
			...spec,
		};
		return this;
	};
});

RouterMeta.prototype.__toObjects = function __toObjects() {
	return {
		pathSpec: this._spec,
		route: {
			path: this._absolutePath,
			metaData: this._childRoutes,
		},
	};
};

export default function parse(config = {}, claypotConfig) {
	const specPaths = {};
	const apis = mapModules(config.controllersPath, claypotConfig.root);
	const routes = [];
	apis
		.forEach(({ name, module }) => {
			const absolutePath = ensureAbsolutePath(name);
			const routerMeta = new RouterMeta(config, name, absolutePath);
			module(routerMeta);
			const {
				pathSpec,
				route,
			} = routerMeta.__toObjects();
			specPaths[absolutePath] = pathSpec;
			routes.push(route);
		})
	;

	return { specPaths, routes };
}
