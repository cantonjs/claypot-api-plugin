import { startServer, stopServer } from './utils';
import fetch from 'node-fetch';

describe('params', () => {
	afterEach(stopServer);

	test('default params', async () => {
		const { urlRoot } = await startServer();
		const res = await fetch(`${urlRoot}/api/foo/defaults`);
		expect(await res.json()).toMatchObject({ page: 1, tags: [] });
	});

	test('param locations', async () => {
		const { urlRoot } = await startServer();
		const res = await fetch(`${urlRoot}/api/foo/params/hello?bar=world`, {
			method: 'POST',
			headers: { baz: '!!!', 'Content-Type': 'application/json' },
			body: JSON.stringify({ qux: '~~~' }),
		});
		expect(await res.json()).toMatchObject({
			foo: 'hello',
			bar: 'world',
			baz: '!!!',
			body: {
				qux: '~~~',
			},
		});
	});

	test('required param', async () => {
		const { urlRoot } = await startServer();
		const res = await fetch(`${urlRoot}/api/foo/required`);
		expect(res.ok).toBe(false);
	});
});
