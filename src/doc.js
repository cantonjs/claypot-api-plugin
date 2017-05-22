
import Koa from 'koa';
import koaStatic from 'koa-static';
import { join } from 'path';
import { readFile } from 'fs-extra';
import { template } from 'lodash';

let tpl;
const readTemplateOnce = async () => {
	if (tpl) { return tpl; }
	return (tpl = readFile(join(__dirname, './doc.html'), 'utf-8'));
};

export default function doc(spec, config) {
	const app = new Koa();
	return app
		.use(async (ctx, next) => {
			if (ctx.request.path === '/') {
				const compiled = template(await readTemplateOnce());
				const html = compiled({
					title: spec.info.title,
					basePath: config.docPath,
					spec: JSON.stringify(spec),
				});
				ctx.type = 'text/html';
				ctx.body = html;
			}
			else {
				await next();
			}
		})
		.use(koaStatic(join(__dirname, '..', 'assets')))
	;
}
