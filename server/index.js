const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const compression = require('compression');
const { CONFIG } = require('../config');
const getCompJSONconfig = require('./getCompJSONconfig');
const { getPageJSON, setPageJSON } = require('./opPageJSON');

const app = express();
const isDev = process.argv.indexOf('-p') === -1;

app.use(compression());
app.use(express.static(path.join(__dirname, '../.build')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.set('view engine', 'ejs');

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.get('/page', (req, res) => {
    res.render(path.join(__dirname, './template/index.ejs'), {
        id: 'app',
        title: '专题页',
        js: [
            `${CONFIG.HOST}:${CONFIG.PORT}/sdk/commons.js`,
            `${CONFIG.HOST}:${CONFIG.PORT}/sdk/page.js`
        ]
    });
});

app.get('/edit', (req, res) => {
    const { debug } = req.query;

    res.render(path.join(__dirname, './template/index.ejs'), {
        id: 'edit',
        title: debug ? '搭建编辑器(开发模式)' : '搭建编辑器',
        js: debug ? [
            `${CONFIG.HOST}:${CONFIG.DEV_SERVER_PORT}/commons.js`,
            `${CONFIG.HOST}:${CONFIG.DEV_SERVER_PORT}/edit.js`
        ] : [
            `${CONFIG.HOST}:${CONFIG.PORT}/sdk/commons.js`,
            `${CONFIG.HOST}:${CONFIG.PORT}/sdk/edit.js`
        ]
    });
});

app.post('/getCompMenu', (req, res) => {
    res.send({
        error: 0,
        msg: 'succ',
        data: getCompJSONconfig()
    });
});

app.post('/loadPage', (req, res) => {
    res.send({
        error: 0,
        msg: 'succ',
        data: getPageJSON()
    });
});

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
    console.log(`\x1B[31m★\x1B[0m editor_channel \x1B[31m★\x1B[0m  server start for debug Editor.`);
    console.log(`编辑器（调试）：\x1B[35m${CONFIG.HOST}:${CONFIG.DEV_SERVER_PORT}/edit?debug=1\x1B[0m`);
} else {
    console.log(`\x1B[32m★\x1B[0m editor_channel \x1B[32m★\x1B[0m  server start.`);
    console.log(`编辑器：\x1B[35m${CONFIG.HOST}:${CONFIG.PORT}/edit\x1B[0m`);
    console.log(`页面预览：\x1B[35m${CONFIG.HOST}:${CONFIG.PORT}/page\x1B[0m`);
}