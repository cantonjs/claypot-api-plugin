
import ensureAbsolutePath from './ensureAbsolutePath';

export default function getDefaultSpec(config, claypotConfig) {
	const info = {
		'version': '1.0.0',
		'title': `${claypotConfig.name} API`,
		...config.info,
	};

	return {
		'swagger': '2.0',
		info,
		'basePath': ensureAbsolutePath(config.basePath),
		'consumes': config.consumes,
		'produces': config.produces,
		'schemes': ['http', claypotConfig.ssl.enable && 'https'].filter(Boolean),
		'paths': {},
		'securityDefinitions': {
			'petstore_auth': {
				'type': 'oauth2',
				'authorizationUrl': 'http://petstore.swagger.io/oauth/dialog',
				'flow': 'implicit',
				'scopes': {
					'write:pets': 'modify pets in your account',
					'read:pets': 'read your pets'
				}
			},
			'api_key': {
				'type': 'apiKey',
				'name': 'api_key',
				'in': 'header'
			}
		},
		'definitions': {},
	};
}
