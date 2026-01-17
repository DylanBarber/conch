const path = require('path');

module.exports = {
    mode: 'development',
    entry: './src/main/main.ts',
    target: 'electron-main',
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
        filename: 'main.js',
        path: path.resolve(__dirname, 'dist/main')
    },
    externals: {
        'electron-store': 'commonjs electron-store'
    }
};
