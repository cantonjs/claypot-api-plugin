
import doc from './doc';
import router from './router';
import getConfig from './utils/getConfig';
import getSpec from './utils/getSpec';
import parse from './utils/parse';

export default class ApiClaypotPlugin {
	constructor(config, claypotConfig) {
		this.config = getConfig(config);
		this.claypotConfig = claypotConfig;
	}

	async initAsync() {
		const { config, claypotConfig } = this;
		const { specPaths, routes } = parse(config, claypotConfig);
		this.spec = await getSpec(specPaths, config, claypotConfig);
		this.routes = routes;
	}

	middleware(app) {
		const { config, spec, routes } = this;
		app
			.mount(config.docPath, doc(spec, config))
			.mount(config.basePath, router(routes, spec, config))
		;
	}
}
