
export function convertToSwaggerPath(url = '/') {
	return url.replace(/:([^/]*)?/g, (m, path) => `{${path}}`);
}

export function convertToKoaPath(url = '/') {
	return url.replace(/\{([^}]*)}/g, (m, path) => `:${path}`);
}
