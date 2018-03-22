import Ajv from 'ajv';
import configSchema from './configSchema';
import ensureAbsolutePath from './ensureAbsolutePath';

const ajv = new Ajv({
	useDefaults: true,
	allErrors: true,
	verbose: true,
});

export default function getConfig(config = {}) {
	const valid = ajv.validate(configSchema, config);
	if (!valid) {
		const error = new Error(
			ajv.errorsText(ajv.errors, {
				dataVar: 'config',
			}),
		);
		error.errors = ajv.errors;
		throw error;
	}

	config.basePath = ensureAbsolutePath(config.basePath);
	return config;
}
