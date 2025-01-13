const path = require('path');

module.exports = {
    entry: './src/index.ts',
    output: {
        filename: 'boundle.js',
        path: path.resolve(__dirname, 'dist'),
    }
}