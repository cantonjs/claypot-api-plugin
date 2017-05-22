
import ensureAbsolutePath from './ensureAbsolutePath';

export default function getConfig(config = {}) {
	config = {
		basePath: '/api',
		docPath: '/doc',
		controllersPath: './apis',
		definitionsPath: './defs',
		securities: {},
		consumes: ['application/json', 'application/x-www-urlencoded'],
		produces: ['application/json'],
		bodyParser: {},
		...config,
	};

	config.basePath = ensureAbsolutePath(config.basePath);

	return config;
}
