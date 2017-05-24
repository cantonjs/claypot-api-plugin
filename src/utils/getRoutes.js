
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import convertURL from './convertURL';
import spec from '../spec';
import auth from '../auth';
import { forEach } from 'lodash';

// function RouterMeta(config, name, path) {
// 	this._config = config;
// 	this._name = name;
// 	this._absolutePath = path;
// 	this.route = { path, metaData: [] };
// };

// httpMethodsWhiteList.forEach((method) => {
// 	RouterMeta.prototype[method] = function (path, pathSpec, ...middlewares) {
// 		path = ensureAbsolutePath(path);
// 		const fullPath = convertURL(this._absolutePath + path);
// 		this.route.metaData.push({
// 			fullPath,
// 			path,
// 			method,
// 			middlewares,
// 		});
// 		spec.addPath(this._name, fullPath, method, pathSpec);
// 		return this;
// 	};
// });

export default function getRoutes(config = {}, claypotConfig) {
	const routes = [];
	const addRoute = function addRoute(name, routeModule = {}) {
		const rootPath = ensureAbsolutePath(name);
		forEach(routeModule, (meta, childPath) => {
			const path = rootPath + childPath;
			const specPath = convertURL(path);
			forEach(meta, (data = {}, key) => {
				const { ctrl, controller, ...pathSpec } = data;
				const ctrls = [].concat(ctrl || controller);
				if (httpMethodsWhiteList.includes(key)) {
					const method = key;
					spec.addPath(name, specPath, method, pathSpec);
					routes.push({ path, method, ctrls, pathSpec });
				}
				else {
					// TODO: handle other keys
				}
			});
		});
	};

	const controllers = mapModules(config.controllersPath, claypotConfig.root);
	if (config.useDefaultAuthRoute) {
		controllers.push({ name: 'auth', module: auth });
	}
	controllers
		.forEach(({ name, module }) => {
			addRoute(name, module);
		})
	;
	return routes;
}
