const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
    devtool: "source-map",
    mode: 'production', // development|production
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js' ]
    },
    module: {
        rules: [
            {
                test: /\.tsx?$/,
                use: ["ts-loader"],
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false
    }
    // optimization: {
    //     minimize: true,
    //     minimizer: [
    //         new TerserPlugin({
    //             terserOptions: {
    //                 ecma: undefined,
    //                 warnings: false,
    //                 parse: {},
    //                 compress: {},
    //                 mangle: true, // Note `mangle.properties` is `false` by default.
    //                 module: false,
    //                 output: null,
    //                 toplevel: false,
    //                 nameCache: null,
    //                 ie8: false,
    //                 keep_classnames: true,
    //                 keep_fnames: true,
    //                 safari10: false,
    //             },
    //         }),
    //     ],
    // },
};