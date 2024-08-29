const { Sheet, Document } = require('../document');

class DecoderBase {
    constructor(sourceConfig) {
        this.sourceConfig = sourceConfig;
    }

    // Decodes an incoming data file and returns a Promise with a list of
    // sheets, each of which has a list of rows, which contain the columns as a
    // list of strings
    async decodeFile(path) {
        throw new Error("Not implemented");
    }


    // Takes an input [ [col1_name, col2_name], [val1, val2], [val1_2, val2_2]] arrays
    // and converts it to a list of { col1_name => val1, col2_name => val2 } like objects
    convertSheetRowsToObjects(sheetData) {
        // is there at least one row?
        if (sheetData.length < 1) {
            // if the sheet is empty the output is empty
            return [];
        }
        // take the first row
        let firstRow = this.mapColumnNamesToIds(sheetData[0]);
        let objectRows = sheetData.slice(1).map((row)=> {
            // the output object
            let outputObject = {};
            // go through all columns
            row.forEach((col, i) => {
                // columns with empty names should be ignored
                let colName = firstRow[i];
                if (typeof colName !== 'string' || colName === '') {
                    return;
                }
                // assign the value to the column
                outputObject[colName] = col;
            });
            return outputObject;
        });
        return objectRows;
    }

    // converts a list of column names to a list of column ids based on the
    // config's 'source.columns' mapping
    mapColumnNamesToIds(columnNames) {
        // convert the column map to a lookup object
        let columnMap = this.sourceConfig.columns.reduce((memo, {name, alias}) => {
            return Object.assign(memo, { [name]: alias });
        }, {});

        return columnNames.map((col) => {
            // check if we have this name
            let newName = columnMap[col];
            return newName ? newName : col;
        });
    }

    // takes a list of rows with a list of strings and returns a new Sheet object.
    sheetFromRawData(name, rawData) {
        return new Sheet(name, this.convertSheetRowsToObjects(rawData));
    }

    documentFromSheets(sheets) {
        return new Document(sheets);
    }
}


module.exports = DecoderBase;