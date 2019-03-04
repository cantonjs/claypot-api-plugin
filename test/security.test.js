import { startServer, stopServer, sign } from './utils';
import fetch from 'node-fetch';

describe('security', () => {
	afterEach(stopServer);

	test('one of securities', async () => {
		const secret = 'test';
		const { urlRoot } = await startServer({
			secret,
			securities: {
				foo: 'X-ACCESS-TOKEN',
				bar: 'X-ACCESS-TOKEN',
			},
			defaultSecurity: [],
		});
		const assessToken = await sign({ security: 'foo' }, secret);
		const res = await fetch(`${urlRoot}/api/security`, {
			headers: { 'X-ACCESS-TOKEN': assessToken },
		});
		expect(await res.json()).toMatchObject({ ok: true, securityKeys: ['foo'] });
	});

	test('securities with diff fields', async () => {
		const secret = 'test';
		const { urlRoot } = await startServer({
			secret,
			securities: {
				foo: 'foo',
				bar: 'bar',
			},
			defaultSecurity: [],
		});
		const fooAssessToken = await sign({ security: 'foo' }, secret);
		const barAssessToken = await sign({ security: 'bar' }, secret);
		const res = await fetch(`${urlRoot}/api/security`, {
			headers: { bar: barAssessToken, foo: fooAssessToken },
		});
		expect(await res.json()).toMatchObject({
			ok: true,
			securityKeys: ['foo', 'bar'],
		});
	});

	test('required security', async () => {
		const secret = 'test';
		const { urlRoot } = await startServer({
			secret,
			securities: {
				foo: 'foo',
				bar: 'bar',
			},
			defaultSecurity: [],
		});
		const res = await fetch(`${urlRoot}/api/security/required`);
		expect(res.status).toBe(401);
	});

	test('required security permission', async () => {
		const secret = 'test';
		const { urlRoot } = await startServer({
			secret,
			securities: {
				foo: 'X-ACCESS-TOKEN',
				bar: 'X-ACCESS-TOKEN',
			},
			defaultSecurity: [],
		});
		const assessToken = await sign({ security: 'bar' }, secret);
		const res = await fetch(`${urlRoot}/api/security/required`, {
			headers: { 'X-ACCESS-TOKEN': assessToken },
		});
		expect(res.status).toBe(403);
	});

	test('required multi', async () => {
		const secret = 'test';
		const { urlRoot } = await startServer({
			secret,
			securities: {
				foo: 'X-ACCESS-TOKEN',
				bar: 'X-ACCESS-TOKEN',
			},
			defaultSecurity: [],
		});
		const assessToken = await sign({ security: 'bar' }, secret);
		const res = await fetch(`${urlRoot}/api/security/requiredmulti`, {
			headers: { 'X-ACCESS-TOKEN': assessToken },
		});
		expect(res.status).toBe(200);
	});
});
