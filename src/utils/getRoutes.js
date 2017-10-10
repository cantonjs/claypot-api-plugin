
import ensureAbsolutePath from './ensureAbsolutePath';
import httpMethodsWhiteList from './httpMethodsWhiteList';
import mapModules from './mapModules';
import spec from '../spec';
import { forEach } from 'lodash';
import logger from './logger';
import convertXKey from './convertXKey';

export default function getRoutes(config = {}, claypotConfig) {
	const routes = [];
	const addRoute = function addRoute(name, routeModule = {}) {
		const rootPath = ensureAbsolutePath(name);

		const paths = [];
		const commons = {};

		Object.keys(routeModule).forEach((key) => {
			const parsedKey = convertXKey(key);
			if (parsedKey.startsWith('/')) {
				paths.push(parsedKey);
			}
			else if (parsedKey.startsWith('x-')) {
				commons[parsedKey] = routeModule[key];
			}
			else if (key === 'security') {
				commons.security = routeModule[key];
			}
			else {
				logger.warn(`Unknown key "${key}" in "${name}"`);
			}
		});

		paths.forEach((childPath) => {
			const meta = Object.assign({}, commons, routeModule[childPath]);
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
				const { ctrl, controller, ...otherSpec } = data;
				let ctrls = [].concat(ctrl || controller).filter(Boolean);
				const pathSpec = spec.addPathMethod(method, name, path, otherSpec);
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
