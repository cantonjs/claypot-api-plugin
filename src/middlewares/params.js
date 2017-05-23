
const getKeyMap = (ctx) => ({
	path: (name) => ctx.params[name],
	body: () => ctx.request.body,
	query: (name) => ctx.query[name],
	header: (name) => ctx.request.get(name),
});

export default function paramsMiddleware(params) {
	return async (ctx, next) => {
		const keyMap = getKeyMap(ctx);
		ctx.clay.params = params.reduce((obj, { key, field, name }) => {
			obj[key] = keyMap[field](name);
			return obj;
		}, {});
		ctx.$params = ctx.clay.params;
		await next();
	};
}
