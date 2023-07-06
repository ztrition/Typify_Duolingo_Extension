const { resolve } = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const CopyWebpackPlugin = require('copy-webpack-plugin');

const tsRule = {
    test: /\.ts(x?)$/,
    exclude: /node_modules/,
    use: 'ts-loader'
}

const plugins = [
    new HTMLWebpackPlugin({
        template: 'src/popup-page/popup.html',
        filename: 'popup.html',
        chunks: ['popup'],
    }),
    new HTMLWebpackPlugin({
        template: 'src/TypingTextArea.html',
        filename: 'TypingTextArea.html',
        chunks: ['TypingTextArea'],
    }),
    new HTMLWebpackPlugin({
        template: 'src/hello_extensions.png',
        filename: 'hello_extensions.png',
        chunks: ['hello_extensions'],
    }),
    new CopyWebpackPlugin({
        patterns: [
            { from: 'public', to: '.' }
        ],
    }),
    new CleanWebpackPlugin(),
]

module.exports = {
    mode: 'development',
    devtool: 'cheap-module-source-map',
    entry: {
        popup: './src/popup-page/popup.ts',
        contentscript: './src/contentScript.ts',
        background: './src/background.ts',
    },
    output: {
        filename: '[name].js',
        path: resolve(__dirname, 'dist'),
    },
    module: {
        rules: [tsRule],
    },
    plugins,
    watch: true,
    watchOptions: {
        ignored: "/node_modules/"
    },
    resolve: {
        extensions: ['.ts']
    }
}