/**
 * @description 编辑器打包配置
 */
const path = require('path');
const webpack = require('webpack');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const AntdDayjsWebpackPlugin = require('antd-dayjs-webpack-plugin');
const WebpackBar = require('webpackbar');
// const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const { CONFIG } = require('../config');

const isDev = process.argv.indexOf('-dev') !== -1;

// const cssFillPath = [
//     path.join(process.cwd(), './src/edit/style/antd.less'),
//     path.join(process.cwd(), './node_modules/')
// ];

const config = {
    entry: {
        main: './src/edit/index.js'
    },
    output: {
        path: path.join(process.cwd(), './.build/edit'),
        publicPath: !isDev ? `${CONFIG.HOST}:${CONFIG.PORT}/edit` : undefined,
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    devServer: {
        compress: false,
        port: CONFIG.DEV_SERVER_PORT,
        inline: true,
        open: false,
        hot: true
    },
    // 公用的代码放到commons.js里
    optimization: {
        splitChunks: {
            cacheGroups: {
                commons: {
                    chunks: 'initial',
                    test: /[\\/]node_modules[\\/]|(antd.less)/,
                    name: 'commons',
                    priority: 10
                }
            }
        }
        // minimize: false,
        // sideEffects: false
        // usedExports: false
        // occurrenceOrder: false
        // flagIncludedChunks: false
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
                oneOf: [
                    {
                        resourceQuery: /modules/, // 只要匹配到了这个，就是用css modules，
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
                        use: [
                            'style-loader',
                            {
                                loader: 'css-loader',
                                options: {
                                    minimize: !isDev
                                }
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    javascriptEnabled: true
                                }
                            }
                        ]
                    }
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
                        ['@babel/plugin-transform-runtime', { 'corejs': 2 }],
                        path.join(__dirname, './plugin/auto-css-modules.js')
                    ]
                }
            }
        ]
    },
    plugins: ([
        new WebpackBar({
            name: 'channel-edit'
        }),
        new CleanWebpackPlugin(),
        new AntdDayjsWebpackPlugin()
    ]).concat(isDev ? [
        new webpack.HotModuleReplacementPlugin()
    ] : [
        // new BundleAnalyzerPlugin()
    ]),
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