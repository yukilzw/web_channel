/**
 * @description 查询Comp仓库内当前所有存在的组件配置config.json
 */
const fs = require('fs');
const path = require('path');

const getCompJSONconfig = () => {
    const compDir = path.join(process.cwd(), './comp/');
    const files = fs.readdirSync(compDir);
    const cmpMap = {};

    files.forEach((item, index) => {
        let stat = fs.lstatSync(path.join(compDir, item));

        if (stat.isDirectory()) {
            const config = JSON.parse(fs.readFileSync(path.join(compDir, item, './config.json'), 'utf-8'));

            cmpMap[item] = config;
        }
    });

    return cmpMap;
};


module.exports = getCompJSONconfig;
