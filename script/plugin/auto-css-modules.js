const { extname } = require('path');
const CSS_EXTNAMES = ['.css', '.scss', '.sass', '.less'];

module.exports = () => ({
    visitor: {
        ImportDeclaration(
            path,
            { opts },
        ) {
            const {
                specifiers,
                source,
                source: { value }
            } = path.node;
            if (specifiers.length && CSS_EXTNAMES.includes(extname(value))) {
                source.value = `${value}?${opts.flag || 'modules'}`;
            }
        }
    }
});