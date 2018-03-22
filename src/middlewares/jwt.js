import jwt from 'jsonwebtoken';
import spec from '../swaggerSpec';
import ms from 'ms';
import logger from '../utils/logger';

const defaultExpiresIn = ms('2h') / 1000;

export default function jwtMiddleware(config) {
	const { securityNames } = spec;
	const defaultSecurityName = securityNames[0];
	const secret = (function () {
		if (config.secret) {
			return config.secret;
		}
		if (defaultSecurityName) {
			logger.warn('It it highly recommend to set a `secret` to config');
		}
		return 'claypot';
	})();

	const sign = function sign(userData, options = {}) {
		const { security = defaultSecurityName, ...other } = options;

		return new Promise((resolve, reject) => {
			const data = { ...userData, security };
			const options = {
				expiresIn: defaultExpiresIn,
				...other,
			};
			const { expiresIn } = options;
			jwt.sign(data, secret, options, (err, accessToken) => {
				if (err) {
					reject(err);
				}
				else {
					resolve({
						accessToken,
						expiresIn,
						expiresInMilliseconds: expiresIn * 1000,
					});
				}
			});
		});
	};

	const verify = function verify(token) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, secret, (err, decoded) => {
				if (err) {
					reject(err);
				}
				else {
					resolve(decoded);
				}
			});
		});
	};

	return async (ctx, next) => {
		ctx.clay.sign = sign;
		ctx.clay.verify = verify;
		await next();
	};
}
