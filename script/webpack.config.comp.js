/**
 * @description 组件打包配置
 */
const path = require('path');
const fs = require('fs');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { CONFIG } = require('../config');

const isDev = process.argv.indexOf('-dev') !== -1;

// 找出组件仓库的所有组件的入口index.js作为每个组件的构建入口分别打包
const compfiles = fs.readdirSync(path.join(process.cwd(), './comp/'));
const Component = {};

compfiles.forEach((item) => {
    Component[item] = `./comp/${item}/index.js`;
});

const config = {
    entry: Component,
    output: {
        path: path.join(process.cwd(), './.build/comp'),
        publicPath: `${CONFIG.HOST}:${CONFIG.PORT}/comp`,
        // 配置library与libraryTarget，让组件加载后挂载到window[name]下
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
    // 所有组件公共的依赖，不需要单独打包，直接取window下的对象
    // 公共对象暴露请见src里的index.js入口
    externals: {
        'react': '__react__',
        'react-dom': '__reactDom__'
    },
    mode: isDev ? 'development' : 'production',
    devtool: 'source-map'
};

module.exports = config;