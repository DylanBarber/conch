const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main/preload.ts',
    target: 'electron-preload',
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: 'ts-loader',
                exclude: /node_modules/
            }
        ]
    },
    resolve: {
        extensions: ['.ts', '.js'],
        alias: {
            '@shared': path.resolve(__dirname, 'src/shared')
        }
    },
    output: {
        filename: 'preload.js',
        path: path.resolve(__dirname, 'dist/main')
    }
};
