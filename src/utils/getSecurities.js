
import { forEach, isString } from 'lodash';

export default function getSecurities(config) {
	let { securities } = config;

	forEach(securities, (name, key) => {
		if (isString(name)) {
			securities[key] = {
				type: 'apiKey',
				in: 'header',
				name,
			};
		}
	});

	return securities;
}
