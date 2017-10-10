
import ensureAbsolutePath from './ensureAbsolutePath';

export default function getConfig(config = {}) {
	config = {
		basePath: '/api',
		docPath: '/doc',
		controllersPath: './apis',
		definitionsPath: './defs',
		securities: {
			defaults: 'X-ACCESS-TOKEN',
		},
		consumes: ['application/json', 'application/x-www-urlencoded'],
		produces: ['application/json'],
		bodyParser: {},
		secret: 'claypot',
		coercion: false,
		...config,
	};

	config.basePath = ensureAbsolutePath(config.basePath);

	return config;
}
