import { startPure } from 'claypot';
import { resolve } from 'path';
import getPort from 'get-port';
import fetch from 'node-fetch';

describe('models', () => {
	let server;
	let port;

	const start = async function start(options) {
		port = await getPort();
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
					},
				},
			],
			...options,
		});
	};

	afterEach(async () => {
		if (server) {
			await server.close();
			start.server = null;
		}
	});

	test('test', async () => {
		await start();
		const res = await fetch(`http://127.0.0.1:${port}/api/users`);
		expect(await res.json()).toEqual({ ok: true });
	});
});
