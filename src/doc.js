import { createApp } from 'claypot';
import koaStatic from 'koa-static';
import koaBasicAuth from 'koa-basic-auth';
import { join } from 'path';
import { readFile } from 'fs-extra';
import { template } from 'lodash';
import spec from './swaggerSpec';

let tpl;
const readTemplateOnce = async () => {
	if (tpl) {
		return tpl;
	}
	return (tpl = readFile(join(__dirname, '..', 'template.html'), 'utf-8'));
};

export default function doc(config) {
	return createApp()
		.use(async (ctx, next) => {
			try {
				await next();
			}
			catch (err) {
				if (err.status === 401) {
					ctx.status = 401;
					ctx.set('WWW-Authenticate', 'Basic');
					ctx.throw(ctx.status);
				}
				else {
					throw err;
				}
			}
		})
		.use(koaBasicAuth({ name: 'admin', pass: 'admin' }))
		.use(async (ctx, next) => {
			if (ctx.request.path === '/') {
				const compiled = template(await readTemplateOnce());
				const specJSON = spec.toJSON();
				const html = compiled({
					title: specJSON.info.title,
					basePath: config.docPath,
					spec: JSON.stringify(specJSON),
				});
				ctx.type = 'text/html';
				ctx.body = html;
			}
			else {
				await next();
			}
		})
		.use(koaStatic(join(__dirname, '..', 'assets')));
}
