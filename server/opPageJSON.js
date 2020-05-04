/**
 * @description 存取页面对应的配置文件
 * 当前编辑器和预览都只有一个页面，保存在./template/page.json中
 * 往后要做到多个页面，可将每一份配置对应一个ID存入数据库中，访问的时候带上此ID查询配置
 */
const fs = require('fs');
const path = require('path');

const jsonPath = path.join(__dirname, './template/page.json');

const getPageJSON = () => {
    const config = fs.readFileSync(jsonPath, 'utf-8');

    return JSON.parse(config);
};

const setPageJSON = (data) => {
    fs.writeFileSync(jsonPath, JSON.stringify(data, null, 2), 'utf-8');
};

module.exports = {
    getPageJSON,
    setPageJSON
};
