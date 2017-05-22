
import doc from './doc';
import router from './router';
import getConfig from './utils/getConfig';
import spec from './spec';
import parse from './utils/parse';

export default class ApiClaypotPlugin {
	constructor(config, claypotConfig) {
		this.config = getConfig(config);
		this.claypotConfig = claypotConfig;
	}

	async initAsync() {
		const { config, claypotConfig } = this;
		await spec.init(config, claypotConfig);
		const { routes } = parse(config, claypotConfig);
		await spec.genDereferenceAsync();
		this.routes = routes;
	}

	middleware(app) {
		const { config, routes } = this;
		app
			.mount(config.docPath, doc(config))
			.mount(config.basePath, router(routes, config))
		;
		spec.alloc();
	}
}
