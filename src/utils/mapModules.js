import glob from 'glob';
import { join, basename } from 'path';

export default function mapModules(baseDir, root) {
	const modules = glob.sync('*.js', {
		cwd: join(root, baseDir),
		absolute: true,
	});
	return modules.map((modulePath) => {
		const result = require(modulePath);
		return {
			name: basename(modulePath, '.js'),
			module: result.default || result,
		};
	});
}
