import logger from './logger';
import pluralize from 'pluralize';

export default function ensureModels(models, paths, config) {
	Object.keys(paths).forEach((path) => {
		const pathSchema = paths[path];
		Object.keys(pathSchema).forEach((method) => {
			const methodSchema = pathSchema[method];
			if (!methodSchema) {
				return;
			}

			const operatorName = methodSchema['x-operator'];
			let modelName = methodSchema['x-model'];

			if (!operatorName || !modelName) {
				return;
			}

			const methodName = method.toUpperCase();
			let model = models[modelName];

			if (modelName && !model && config.pluralize) {
				const altModelName = pluralize.singular(modelName);
				if (models[altModelName]) {
					modelName = methodSchema['x-model'] = altModelName;
					model = models[modelName];
				}
			}

			if (modelName && !model) {
				logger.error(
					`Model "${modelName}" in "${methodName} ${path}" not found`,
				);
			}

			if (!model || !model[operatorName]) {
				const operator = `${modelName}.${operatorName}`;
				logger.error(
					`Operator "${operator}" in "${methodName} ${path}" not found`,
				);
			}
		});
	});
}
