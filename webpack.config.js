const path = require('path');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');

module.exports = {
    devtool: "source-map",
    mode: 'production', // development|production
    entry: './src/index.tsx',
    // plugins: [
    //     new ExtractTextPlugin("styles.css"),
    // ],
    plugins: [
        new MiniCssExtractPlugin({
            // Options similar to the same options in webpackOptions.output
            // both options are optional
            filename: '[name].css',
            chunkFilename: '[id].css',
        }),
    ],
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'app.js'
    },
    resolve: {
        extensions: [ '.tsx', '.ts', '.js', '.css' ]
        // extensions: [ '.tsx', '.ts', '.js' ]
    },
    module: {
        rules: [
            // {
            //     test: /\.less$/,
            //     use: ExtractTextPlugin.extract({
            //         fallback: "style-loader",
            //         use: [
            //             {loader: "css-loader"},
            //             {
            //                 loader: "less-loader",
            //                 options: {
            //                     includePaths: ["./src/"]
            //                 }
            //             },
            //         ]
            //     })
            // },

            // {
            //     test: /\.(le|sa|sc|c)ss$/,
            //     use: [
            //         {
            //             loader: MiniCssExtractPlugin.loader,
            //         },
            //         'css-loader',
            //         'less-loader',
            //         'postcss-loader',
            //         'sass-loader',
            //     ],
            // },

            // {
            //     test: /\.css/,
            //     use: [
            //         'style-loader',
            //         'css-loader'
            //     ],
            //     include: __dirname + '/src'
            // },

            {
                test: /\.css$/,
                use: [
                    // {
                    //     loader: MiniCssExtractPlugin.loader,
                    // },
                    // MiniCssExtractPlugin.loader,
                    'css-modules-typescript-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            modules: true
                        }
                    }
                ]
            },

            // {
            //     test: /\.less$/,
            //     loader: 'less-loader', // compiles Less to CSS
            //     exclude: /node_modules/
            // },
            {
                test: /\.tsx?$/,
                use: ["ts-loader"],
                exclude: /node_modules/
            }
        ]
    },
    optimization: {
        minimize: false,
        splitChunks: {
            cacheGroups: {
                styles: {
                    name: 'styles',
                    test: /\.css$/,
                    chunks: 'all',
                    enforce: true,
                },
            },
        },
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