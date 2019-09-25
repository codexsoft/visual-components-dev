const path = require('path');

module.exports = {
    mode: 'production', // development|production
    entry: './src/index.tsx',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'dist/app.js'
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
    }
};