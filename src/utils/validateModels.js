
import { getModels } from 'claypot/lib/models';
import logger from './logger';

export default function validateModels(paths) {
	const models = getModels();
	Object.keys(paths).forEach((path) => {
		const pathSchema = paths[path];
		Object.keys(pathSchema).forEach((method) => {
			const methodSchema = pathSchema[method];
			if (!methodSchema) { return; }

			const operatorName = methodSchema['x-operator'];
			const modelName = methodSchema['x-model'];

			if (!operatorName || !modelName) { return; }

			const methodName = method.toUpperCase();
			const model = models[modelName];
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
