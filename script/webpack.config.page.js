const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const searchComp = require('./searchComponent');

const isDev = process.argv.indexOf('-p') === -1;

const config = {
    module: {
        rules: [{
            test: /\.(gif|jpe?g|png|svg)$/,
            use: {
                loader: 'file-loader'
            }
        },
        {
            test: /\.(css|less)$/,
            use: [
                'style-loader',
                'css-loader?minimize=' + !isDev,
                'less-loader'
            ]
        }]
    },
    plugins: [
        new CleanWebpackPlugin()
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

const configBase = {
    ...config,
    entry: {
        sdk: './src/page/index.js'
    },
    output: {
        path: path.join(process.cwd(), './static/dist'),
        publicPath: 'http://127.0.0.1:1235/dist',
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
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
            ...config.module.rules,
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
    plugins: [
        /* new HtmlWebpackPlugin({
            template: path.join(process.cwd(), './src/index.html'),
            filename: 'index.html',
            inject: 'body',
            minify: {
                removeComments: false,
                collapseWhitespace: false,
                minifyJS: true,
                minifyCSS: true
            }
        }) */
    ]
};

const configComp = {
    ...config,
    externals: {
        'react': '__react__',
        'react-dom': '__reactDom__',
        'axios': '__axios__'
    },
    entry: searchComp,
    output: {
        path: path.join(process.cwd(), './static/dist'),
        publicPath: 'http://127.0.0.1:1235/dist',
        library: '[name]',
        libraryTarget: 'this',
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    module: {
        rules: [
            ...config.module.rules,
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
            }
        ]
    }
};

module.exports = [configBase, configComp];