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
