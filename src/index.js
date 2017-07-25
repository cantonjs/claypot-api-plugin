
import doc from './doc';
import router from './router';
import getConfig from './utils/getConfig';
import spec from './spec';
import getRoutes from './utils/getRoutes';

export default class ApiClaypotPlugin {
	constructor(config, claypotConfig) {
		this.config = getConfig(config);
		this.claypotConfig = claypotConfig;
	}

	async initServer() {
		const { config, claypotConfig } = this;
		await spec.init(config, claypotConfig);
		this.routes = getRoutes(config, claypotConfig);
		await spec.genDereferenceAsync();
	}

	middleware(app) {
		const { config, routes } = this;
		if (config.docPath) { app.mount(config.docPath, doc(config)); }
		app.mount(config.basePath, router(routes, config));
		spec.alloc();
	}
}
