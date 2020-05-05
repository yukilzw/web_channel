/**
 * @description 预览页打包配置
 */
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { CONFIG } = require('../config');

const isDev = process.argv.indexOf('-dev') !== -1;

const config = {
    entry: {
        main: './src/page/index.js'
    },
    output: {
        path: path.join(process.cwd(), './.build/page'),
        publicPath: !isDev ? `${CONFIG.HOST}:${CONFIG.PORT}/page` : undefined,
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    // 公用的代码放到commons.js里
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]/,
                    name: 'commons',
                    priority: 10
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.(gif|jpe?g|png|svg)$/,
                use: [{
                    loader: 'file-loader'
                }]
            },
            {
                test: /\.(css|less)$/,
                use: [
                    'style-loader',
                    {
                        loader: 'css-loader',
                        options: {
                            minimize: !isDev,
                            modules: true,
                            localIdentName: isDev ? '[path]-[local]' : '[hash:base64:6]'
                        }
                    },
                    'less-loader'
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
                        '@babel/plugin-transform-object-assign',
                        ['@babel/plugin-transform-runtime', { 'corejs': 2 }]
                    ]
                }
            }
        ]
    },
    plugins: ([
        new CleanWebpackPlugin()
    ]).concat(isDev ? [
        new webpack.HotModuleReplacementPlugin()
    ] : []),
    resolve: {
        extensions: [
            '.js',
            '.jsx'
        ]
    },
    mode: isDev ? 'development' : 'production',
    devtool: 'source-map'
};

module.exports = config;