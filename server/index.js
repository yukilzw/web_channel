const path = require('path');
const express = require('express');
const ejs = require('ejs');
const bodyParser = require('body-parser');
const app = express();

app.use(express.static(path.join(__dirname, '../static')));
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.engine('html', ejs.__express);
app.set('view engine', 'html');

app.get('/topic/*', (req, res) => {
    res.render('../static/dist/index.html');
});

app.post('/loadPage', (req, res) => {

    res.send({ });
});

app.listen(1235);

console.log('market server start.');