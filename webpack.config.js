const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

const isDev = process.argv.indexOf('-p') === -1;

module.exports = {
    entry: {
        entry: './src/index.js'
    },
    output: {
        path: 'E:\\factory\\py\\tornado\\static\\dist',
        library: '[name]',
        libraryTarget: 'global',
        filename: 'bundle.js',
        chunkFilename: '[name]_[chunkhash:5].js'
    },
    externals : {
        // 'react': 'react',
        // 'react-dom': 'reactDom'
    },
    module: {
        rules: [{
            test: /\.(gif|jpe?g|png|svg)$/,
            use: {
                loader: 'file-loader'
            }
        },
        {
            test: /\.(css)$/,
            use: [
                'style-loader',
                'css-loader?minimize=' + !isDev
            ]
        },
        {
            test: /\.js$/,
            exclude: [path.join(process.cwd(), './node_modules/')],
            loader: 'babel-loader',
            options: {
                presets: [
                    ['@babel/preset-env', { modules: false }],
                    '@babel/preset-react'
                ],
                plugins: [
                    ['@babel/plugin-proposal-decorators', { 'legacy': true }],
                    '@babel/proposal-class-properties',
                    '@babel/plugin-syntax-dynamic-import',
                    '@babel/plugin-transform-object-assign'
                ]
            }
        }]
    },
    plugins: [
        new CleanWebpackPlugin(),
        new HtmlWebpackPlugin({
            template: path.join(process.cwd(), './index.html'),
            filename: 'index.html',
            inject: 'body',
            minify: {
                removeComments: false,
                collapseWhitespace: false,
                minifyJS: false,
                minifyCSS: false
            }
        })
    ],
    resolve: {
        extensions: [
            '.js',
            '.jsx'
        ]
    },
    mode: isDev ? 'development' : 'production',
    devtool: isDev ? 'source-map' : 'source-map'
};