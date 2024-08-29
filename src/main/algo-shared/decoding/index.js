const {FILE_CSV, FILE_XLSX} = require('../document');

const makeCsvDecoder = require('./csv');
const makeXlsxDecoder = require('./xlsx');


// Returns the file type based on the file name
function fileTypeOf(filePath) {
    if (filePath.endsWith(".xlsx")) {
        return FILE_XLSX
    }

    if (filePath.endsWith(".csv")) {
        return FILE_CSV
    }


    // unknown type
    return null;
}

// Returns an appropriate decoder for a file
function decoderForFile(fileType) {
    switch (fileType) {
        case FILE_XLSX:
            return makeXlsxDecoder;
        case FILE_CSV:
            return makeCsvDecoder;
        default:
            throw new Error(`Unknown file type: '${filePath}'`)
    }
}


module.exports = {
    fileTypeOf,
    decoderForFile,
}