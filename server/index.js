const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express();

const getCompJSONconfig = require('./getCompJSONconfig');
const { getPageJSON, setPageJSON } = require('./opPageJSON');

app.use(compression());
app.use(express.static(path.join(__dirname, '../static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.all('*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', '*');
    next();
});

app.get('/topic/*', (req, res) => {
    res.render(path.join(__dirname, './template/index.html'));
});

app.get('/edit', (req, res) => {
    res.render(path.join(__dirname, './template/edit.html'));
});

app.post('/getCompMenu', (req, res) => {
    res.send({
        error: 0,
        msg: '',
        data: getCompJSONconfig()
    });
});

app.post('/loadPage', (req, res) => {
    res.send({
        error: 0,
        msg: '',
        data: getPageJSON()
    });
});

app.post('/savePage', (req, res) => {
    setPageJSON(req.body);
    res.send({
        error: 0,
        msg: '保存成功',
        data: null
    });
});

app.listen(1235);

console.log('server start.');