import doc from './doc';
import router from './router';
import getConfig from './utils/getConfig';
import spec from './spec';
import getRoutes from './utils/getRoutes';
import logger from './utils/logger';
import validateModels from './utils/validateModels';

export default class ApiClaypotPlugin {
	constructor(config, claypotConfig) {
		this.config = getConfig(config);
		this.claypotConfig = claypotConfig;
	}

	async willStartServer(app) {
		const { config, claypotConfig } = this;
		const { models } = app;
		await spec.init(config, claypotConfig);
		this.routes = getRoutes(config, claypotConfig);
		const deref = await spec.genDereferenceAsync();
		if (!claypotConfig.production) {
			validateModels(models, deref.paths, config);
		}
	}

	middleware(app) {
		const { config, routes } = this;
		if (config.docPath) {
			app.mount(config.docPath, doc(config));
			logger.debug(`doc mounted on "${config.docPath}"`);
		}
		app.mount(config.basePath, router(routes, config));
		logger.debug(`api mounted on "${config.basePath}"`);

		spec.alloc();
	}
}
