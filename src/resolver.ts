import { Resolver } from '@parcel/plugin';
import * as path from 'path';
import {generate, parse} from "./parser";

export default new Resolver({
	// eslint-disable-next-line @typescript-eslint/require-await
	async resolve({ specifier , options}) {
		if (specifier !== 'corfu-config') {
			return null;
		}

		const pathToConfig = path.resolve(options.projectRoot, '../../on-board-software-master');

		const dashboards = await parse(pathToConfig, options.inputFS);

		return {
			filePath: path.resolve(__dirname, 'parser.js'),
			code: generate(dashboards)
		};
	}
});
