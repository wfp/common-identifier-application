const path = require('node:path');


function resolveHtmlPath(htmlFileName) {
    // if (process.env.NODE_ENV === 'development') {
    //   const port = process.env.PORT || 1212;
    //   const url = new URL(`http://localhost:${port}`);
    //   url.pathname = htmlFileName;
    //   return url.href;
    // }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
  }

module.exports = {
    resolveHtmlPath
}