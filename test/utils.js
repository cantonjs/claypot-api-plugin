import { startPure } from 'claypot';
import jwt from 'jsonwebtoken';
import { resolve } from 'path';
import getPort from 'get-port';

let server;

export async function startServer(pluginConfig, claypotConfig) {
	const port = await getPort();
	server = await startPure({
		port,
		cwd: resolve('test'),
		execCommand: 'babel-register',
		production: false,
		plugins: [
			{
				module: '../src',
				options: {
					controllersPath: 'apis',
					definitionsPath: 'defs',
					info: {
						version: '0.0.1',
					},
					securities: {
						defaults: 'X-ACCESS-TOKEN',
						admin: 'X-ACCESS-TOKEN',
					},
					defaultSecurity: ['defaults'],
					pluralize: true,
					...pluginConfig,
				},
			},
		],
		...claypotConfig,
	});
	return {
		port,
		urlRoot: `http://127.0.0.1:${port}`,
	};
}

export async function stopServer() {
	if (server) {
		await server.close();
		startServer.server = null;
	}
}

export async function sign(data = {}, secret = 'test') {
	return new Promise((resolve, reject) => {
		jwt.sign(data, secret, {}, (err, accessToken) => {
			if (err) reject(err);
			else resolve(accessToken);
		});
	});
}
