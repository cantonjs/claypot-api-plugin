
import bodyParser from 'koa-bodyparser';

const getBodyParserConfig = (config) => {
	const { consumes = [], bodyParser: bodyParserConfig } = config;
	const enableTypes = [];
	if (consumes.includes('application/json')) {
		enableTypes.push('json');
	}
	if (consumes.includes('application/x-www-urlencoded')) {
		enableTypes.push('form');
	}

	return {
		enableTypes,
		...bodyParserConfig,
	};
};

export default function bodyMiddleware(config) {
	return bodyParser(getBodyParserConfig(config));
}
