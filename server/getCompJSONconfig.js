const fs = require('fs');
const path = require('path');

const getCompJSONconfig = () => {
    const compDir = path.join(process.cwd(), './comp/');
    const files = fs.readdirSync(compDir);
    const jsonArr = [];

    files.forEach((item, index) => {
        let stat = fs.lstatSync(path.join(compDir, item));

        if (stat.isDirectory()) {
            const config = JSON.parse(fs.readFileSync(path.join(compDir, item, './config.json'), 'utf-8'));

            jsonArr.push(config);
        }
    });

    return jsonArr;
};


module.exports = getCompJSONconfig;
