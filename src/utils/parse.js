
import ensureAbsolutePath from './ensureAbsolutePath';
import getSpecPath from './getSpecPath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import convertURL from './convertURL';

function RouterMeta(config, name, absolutePath) {
	this._config = config;
	this._name = name;
	this._absolutePath = absolutePath;
	this._spec = {};
	this._childRoutes = [];
};

httpMethodsWhiteList.forEach((method) => {
	RouterMeta.prototype[method] = function (pathname, spec, ...middlewares) {
		spec = getSpecPath(spec);

		const path = convertURL(this._absolutePath + pathname);
		this._childRoutes.push({
			pathname: ensureAbsolutePath(pathname),
			method,
			middlewares,
			spec,
		});
		const pathSpec = this._spec[path] || (this._spec[path] = {});
		pathSpec[method] = {
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
	let specPaths = {};
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
			specPaths = pathSpec;
			routes.push(route);
		})
	;

	return { specPaths, routes };
}
