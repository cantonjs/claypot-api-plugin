import { startServer, stopServer } from './utils';
import fetch from 'node-fetch';

describe('claypot restful plugin', () => {
	afterEach(stopServer);

	test('basic usage', async () => {
		const { urlRoot } = await startServer();
		const res = await fetch(`${urlRoot}/api/users`);
		expect(await res.json()).toEqual({ ok: true });
	});
});
