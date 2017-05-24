
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import spec from '../spec';
import { forEach } from 'lodash';

export default function getRoutes(config = {}, claypotConfig) {
	const routes = [];
	const addRoute = function addRoute(name, routeModule = {}) {
		const rootPath = ensureAbsolutePath(name);
		forEach(routeModule, (meta, childPath) => {
			const path = rootPath + childPath;
			const pathGlobalSpecs = {};
			const methods = [];
			forEach(meta, (data = {}, key) => {
				if (httpMethodsWhiteList.includes(key)) {
					methods.push({ method: key, data });
				}
				else {
					pathGlobalSpecs[key] = data;
				}
			});

			spec.addPath(name, path, pathGlobalSpecs);

			methods.forEach(({ method, data }) => {
				const { ctrl, controller, ...pathSpec } = data;
				const ctrls = [].concat(ctrl || controller);
				spec.addPath(name, path, pathSpec, method);
				routes.push({ path, method, ctrls, pathSpec });
			});
		});
	};

	const controllers = mapModules(config.controllersPath, claypotConfig.root);
	controllers
		.forEach(({ name, module }) => {
			addRoute(name, module);
		})
	;
	return routes;
}
