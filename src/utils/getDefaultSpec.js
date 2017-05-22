
import ensureAbsolutePath from './ensureAbsolutePath';
import ensureSecurityExplication from './ensureSecurityExplication';

export default function getDefaultSpec(config, claypotConfig) {
	const info = {
		'version': '1.0.0',
		'title': `${claypotConfig.name} API`,
		...config.info,
	};

	const spec = {
		'swagger': '2.0',
		info,
		'basePath': ensureAbsolutePath(config.basePath),
		'consumes': config.consumes,
		'produces': config.produces,
		'schemes': ['http', claypotConfig.ssl.enable && 'https'].filter(Boolean),
		'paths': {},
		'securityDefinitions': {},
		'definitions': {},
	};

	if (config.defaultSecurity) {
		spec.security = ensureSecurityExplication(config.defaultSecurity);
	}

	return spec;
}
