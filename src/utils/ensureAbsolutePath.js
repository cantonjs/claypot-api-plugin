
export default function ensureAbsolutePath(path = '') {
	return path.startsWith('/') ? path : `/${path}`;
}
