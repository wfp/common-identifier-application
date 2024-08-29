const fs = require('fs/promises');
const csv = require('csv-parse/sync');


const DecoderBase = require('./base');


// A decoder for CSVs
class CsvDecoder extends DecoderBase {

    constructor(sourceConfig, csvOptions={}) {
        super(sourceConfig)
        this.csvOptions = csvOptions;
    }

    async decodeFile(path, fileEncoding='utf-8') {
        let data = await fs.readFile(path, fileEncoding);
        let parsed = csv.parse(data, this.csvOptions);
        return this.documentFromSheets([
            this.sheetFromRawData("Sheet 1", parsed)
        ]);
    }
}


// Factory function for the CSV decoder
function makeCsvDecoder(sourceConfig) {
    return new CsvDecoder(sourceConfig);
}

module.exports = makeCsvDecoder;