const fs = require('fs');
const path = require('path');

const files = fs.readdirSync(path.join(process.cwd(), './comp/'));

const Component = {};

files.forEach((item) => {
    Component[item] = `./comp/${item}/index.js`;
});


module.exports = Component;
