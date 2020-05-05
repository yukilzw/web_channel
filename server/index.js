/**
 * @description 建站平台服务端
 * 用于处理编辑器、预览页的接口请求，以及服务端路由
 * （PS：编辑器与预览页相互独立，引用的JS文件也不同，不属于SPA，因此不能使用客户端路由）
 */
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const { CONFIG } = require('../config');
const getCompJSONconfig = require('./getCompJSONconfig');
const { getPageJSON, setPageJSON } = require('./opPageJSON');

const app = express();
const isDev = process.argv.indexOf('-dev') !== -1;

app.use(compression());
app.use(express.static(path.join(__dirname, '../.build')));
app.use('/template', express.static(path.join(__dirname, './template')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

// 预览页面路由模板
app.get('/page', (req, res) => {
    res.render(path.join(__dirname, './template/index.ejs'), {
        id: 'app',
        title: '预览页',
        js: [
            `${CONFIG.HOST}:${CONFIG.PORT}/page/commons.js`,
            `${CONFIG.HOST}:${CONFIG.PORT}/page/main.js`
        ]
    });
});

// 编辑器路由模板
app.get('/edit', (req, res) => {
    const { debug } = req.query;

    res.render(path.join(__dirname, './template/index.ejs'), {
        id: 'edit',
        title: debug ? '搭建编辑器(开发模式)' : '搭建编辑器',
        js: debug ? [
            `${CONFIG.HOST}:${CONFIG.DEV_SERVER_PORT}/commons.js`,
            `${CONFIG.HOST}:${CONFIG.DEV_SERVER_PORT}/main.js`
        ] : [
            `${CONFIG.HOST}:${CONFIG.PORT}/edit/commons.js`,
            `${CONFIG.HOST}:${CONFIG.PORT}/edit/main.js`
        ]
    });
});

// 编辑器内获取当前可拖入的组件菜单
app.post('/getCompMenu', (req, res) => {
    res.send({
        error: 0,
        msg: 'succ',
        data: getCompJSONconfig()
    });
});

// 获取当前页面的JSON配置以此来渲染出DOM
app.post('/loadPage', (req, res) => {
    res.send({
        error: 0,
        msg: 'succ',
        data: getPageJSON()
    });
});

// 编辑器内保存当前修改
app.post('/savePage', (req, res) => {
    setPageJSON(req.body);
    res.send({
        error: 0,
        msg: 'succ',
        data: null
    });
});

app.listen(CONFIG.PORT);

if (isDev) {
    console.log(`\x1B[31m★\x1B[0m web_channel\x1B[31m★\x1B[0m  server start for debug Editor.`);
    console.log(`编辑器（开发）：\x1B[35m${CONFIG.HOST}:${CONFIG.PORT}/edit?debug=1\x1B[0m`);
} else {
    console.log(`\x1B[32m★\x1B[0m web_channel\x1B[32m★\x1B[0m  server start.`);
    console.log(`编辑器：\x1B[35m${CONFIG.HOST}:${CONFIG.PORT}/edit\x1B[0m`);
    console.log(`页面预览：\x1B[35m${CONFIG.HOST}:${CONFIG.PORT}/page\x1B[0m`);
}