
export default function getParamValue(ctx) {
	const keyMap = {
		path: (name) => ctx.params[name],
		body: () => ctx.request.body,
		query: (name) => ctx.query[name],
		header: (name) => ctx.request.get(name),
	};

	return (loc, name) => keyMap[loc](name);
}
