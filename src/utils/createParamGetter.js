import logger from './logger';

export default function createParamGetter(ctx, debugMsg) {
	const keyMap = {
		path: (name) => ctx.params[name],
		body: () => ctx.request.body,
		query: (name) => ctx.query[name],
		header: (name) => ctx.request.get(name),
	};

	return function getParamValue(loc, name) {
		if (keyMap.hasOwnProperty(loc)) {
			return keyMap[loc](name);
		}
		logger.error(
			`Illegal param location "${loc}".`,
			`Expected one of ${Object.keys(keyMap)
				.map((k) => `"${k}"`)
				.join(', ')}.`,
			`Please checkout in ${debugMsg}`,
		);
	};
}
