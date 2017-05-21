
import doc from './doc';
import router from './router';
import getConfig from './utils/getConfig';
import parse from './utils/parse';

export default class ApiClaypotPlugin {
	constructor(config, claypotConfig) {
		this.config = getConfig(config);
		this.claypotConfig = claypotConfig;
	}

	middleware(app) {
		const { config, claypotConfig } = this;
		const { specPaths, routes } = parse(config, claypotConfig);
		app
			.mount(config.docPath, doc(specPaths, config, claypotConfig))
			.mount(config.basePath, router(routes, config))
		;
	}
}
