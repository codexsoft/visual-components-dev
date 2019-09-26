const path = require('path');
var DeclarationBundlerPlugin = require('declaration-bundler-webpack-plugin');

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
    plugins: [
        new DeclarationBundlerPlugin({
            // moduleName:'some.path.moduleName',
            // moduleName:'./src/index.tsx',
            // moduleName:'./src/index.tsx',
            moduleName:'src.*',
            out:'./dist/app.d.ts',
        })
    ]
};