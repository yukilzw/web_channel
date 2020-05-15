/**
 * @description 查询每个组件当前对应的js资源地址
 */
const fs = require('fs');
const path = require('path');
const { CONFIG } = require('../config');

const getCompJSONconfig = () => {
    const buildCompDir = path.join(process.cwd(), './.build/comp/');
    const files = fs.readdirSync(buildCompDir);
    const buildCmpMap = {};

    files.forEach((item, index) => {
        let stat = fs.lstatSync(path.join(buildCompDir, item));

        if (stat.isFile() && /\.js$/.test(item)) {
            const jsFileName = item.replace(/\.js$/, '');
            const [compName] = jsFileName.split('_');

            buildCmpMap[compName] = `${CONFIG.HOST}:${CONFIG.PORT}/comp/${item}`;
        }
    });

    return buildCmpMap;
};


module.exports = getCompJSONconfig;
