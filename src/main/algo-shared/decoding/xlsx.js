let XLSX = require("xlsx");
let fs = require("node:fs/promises");

const DecoderBase = require('./base');
const {Sheet, Document} = require('../document');


// A decoder for CSVs
class XlsxDecoder extends DecoderBase {

    constructor(sourceConfig, csvOptions={}) {
        super(sourceConfig)
        this.csvOptions = csvOptions;
    }

    async decodeFile(path, fileEncoding='utf-8') {
        let data = await fs.readFile(path);
        let workbook = XLSX.read(data);

        let sheets = workbook.SheetNames.map((sheetName) => {
            const worksheet = workbook.Sheets[sheetName];
            // load the data from the sheet
            const data = XLSX.utils.sheet_to_json(worksheet, {})
            // convert the human names to aliases
            const dataWithAliases = this.renameColumnsToAliases(data)

            return new Sheet(sheetName, dataWithAliases);
        })

        let document = this.documentFromSheets(sheets);
        return document;
    }

    // Renames the incoming columns from their hunan names to their aliases
    renameColumnsToAliases(data) {
        let keyList = this.sourceConfig.columns;
        // console.log("SOURCECONFGIG=>", this.sourceConfig)
        return data.map((row) => {

            return keyList.reduce((memo, {name, alias}) => {
                return Object.assign(memo, {[alias]: row[name] || row[alias]});
            }, {})
        });
    }
}


// Factory function for the CSV decoder
function makeXlsxDecoder(sourceConfig) {
    return new XlsxDecoder(sourceConfig);
}

module.exports = makeXlsxDecoder;


