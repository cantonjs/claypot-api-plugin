
import jwt from 'jsonwebtoken';
import spec from '../spec';

export default function jwtMiddleware(config) {
	const { securityNames } = spec;
	const defaultSecurityName = securityNames[0];

	const sign = function sign(userData, options = {}) {
		const { security = defaultSecurityName, ...other } = options;

		return new Promise((resolve, reject) => {
			jwt.sign({
				...userData,
				security,
			}, config.secret, {
				expiresIn: '2h',
				...other,
			}, (err, token) => {
				if (err) { reject(err); }
				else { resolve(token); }
			});
		});
	};

	const verify = function verify(token) {
		return new Promise((resolve, reject) => {
			jwt.verify(token, config.secret, (err, decoded) => {
				if (err) { reject(err); }
				else { resolve(decoded); }
			});
		});
	};

	return async (ctx, next) => {
		ctx.clay.sign = sign;
		ctx.clay.verify = verify;
		await next();
	};
}
