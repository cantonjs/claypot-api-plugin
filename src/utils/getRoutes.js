
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import convertURL from './convertURL';
import spec from '../spec';
import auth from '../auth';
import { forEach } from 'lodash';

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
