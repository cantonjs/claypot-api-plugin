
export default function convertURL(url = '/') {
	return url.replace(/:([^/]*)?/g, (m, path) => `{${path}}`);
}
