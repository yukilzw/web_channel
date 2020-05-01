const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const compression = require('compression');
const app = express();

const getCompJSONconfig = require('./getCompJSONconfig');

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

app.post('/getCurrentComp', (req, res) => {
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
        data: [
            {
                el: 'bc1',
                hook: 'http://localhost:1235/dist/View.js',
                name: 'View',
                props: {},
                style: { 'width': '100%', 'height': '300px', 'backgroundColor': 'red' },
                children: [
                    {
                        el: 'bc1-1',
                        hook: 'http://localhost:1235/dist/Text.js',
                        name: 'Text',
                        props: { text: '这是一段文本' },
                        style: { 'color': '#fff', 'fontSize': '20px', 'textAlign': 'center' }
                    },
                    {
                        el: 'bc1-2',
                        hook: 'http://localhost:1235/dist/Image.js',
                        name: 'Image',
                        props: {
                            src: 'https://timgsa.baidu.com/timg?image&quality=80&size=b9999_10000&sec=1588305791655&di=a4c4e7f039335e817fb013ae7ed5c85a&imgtype=0&src=http%3A%2F%2Fimg5.iqiyipic.com%2Fimage%2Fppopen%2Fppopen_5ba51077ad8c1227bbf05f06_0.jpg',
                            link: 'https://www.douyu.com'
                        },
                        style: {
                            'width': '100px',
                            'height': '100px',
                            'marginLeft': 'auto',
                            'marginRight': 'auto',
                            'marginTop': '0px'
                        }
                    }
                ]
            },
            {
                el: 'bc2',
                hook: 'http://localhost:1235/dist/View.js',
                name: 'View',
                props: {},
                style: { 'width': '100%', 'height': '300px', 'backgroundColor': 'blue' }
            }
        ]
    });
});

app.listen(1235);

console.log('market server start.');