import {Options} from "webpack";

const TerserPlugin = require('terser-webpack-plugin');

let opti: Options.Optimization = {
	minimizer: [
		new TerserPlugin()
	]
};
export {opti};
