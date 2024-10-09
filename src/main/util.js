const path = require('node:path');


function resolveHtmlPath(htmlFileName) {
    console.log(`ENV: ${process.env.NODE_ENV}`)
    if (process.env.NODE_ENV === 'development') {
      const port = process.env.PORT || 5173;
      const url = new URL(`http://localhost:${port}`);
      url.pathname = htmlFileName;
      return url.href;
    }
    return `file://${path.resolve(__dirname, '../renderer/', htmlFileName)}`;
}


// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    const lastComponent = splitName[splitName.length - 1].split(/\.+/);
    return lastComponent.slice(0,-1).join('.')
}

module.exports = {
    resolveHtmlPath,
    baseFileName,
}