
import ensureSecurityExplication from './ensureSecurityExplication';

export default function getSpecPath(specPath) {
	specPath = ensureSecurityExplication(specPath);

	const { responses = {} } = specPath;

	if (!responses || !responses[400]) {
		responses[400] = {
			description: 'Payload Error',
			schema: {
				$ref: '#/definitions/DefaultErrorResponse',
			},
		};
		specPath.responses = responses;
	}

	return specPath;
}
