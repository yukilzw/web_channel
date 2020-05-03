const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { CONFIG } = require('../config');

const isDev = process.argv.indexOf('-p') === -1;

const compfiles = fs.readdirSync(path.join(process.cwd(), './comp/'));
const Component = {};

compfiles.forEach((item) => {
    Component[item] = `./comp/${item}/index.js`;
});

const config = {
    entry: Component,
    output: {
        path: path.join(process.cwd(), './.build/dist'),
        publicPath: `${CONFIG.HOST}:${CONFIG.PORT}/dist`,
        library: '[name]',
        libraryTarget: 'this',
        filename: '[name].js',
        chunkFilename: '[name].js'
    },
    module: {
        rules: [
            {
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
            }
        ]
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
    externals: {
        'react': '__react__',
        'react-dom': '__reactDom__'
    },
    mode: isDev ? 'development' : 'production',
    devtool: 'source-map'
};

module.exports = config;