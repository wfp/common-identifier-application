
let XLSX = require("xlsx");
const fs = require('node:fs');

const EncoderBase = require('./base');

class XlsxEncoder extends EncoderBase {
    constructor(mapping, options) {
        super(mapping)

        this.options = options;

        // the base path of the document we'll write
        this.basePath = null;

        // attempts to set the column widths wide enough to fit the data displayed
        // in them.
        this.formatOutputDocument = true;
    }

    startDocument(document, outputPath, options={}) {
        let opts = Object.assign({
            // default options go here
        }, options);

        // store the base path
        this.basePath = outputPath;

        // create the new workbook
        this.workbook = XLSX.utils.book_new();
    }

    // Ends wiriting the document
    endDocument(document) {
        // no base path means no document yet, so we'll skip
        if (!this.basePath) {
            return;
        }

        let fileOutputPath = this._getOutputNameFor(this.basePath) + '.xlsx';

        this._withTemporaryFile(fileOutputPath, (temporaryFilePath) => {
            XLSX.writeFile(this.workbook, temporaryFilePath, { compression: true });

            console.log("[XLSX] Written ", temporaryFilePath);
        })

        // add the current file to the list of outputs
        this.outputPaths.push(fileOutputPath);
        // otherwise we'll return
        // TODO: this is where metadata injection (writing a summary text file next to the output files) can happen
        return;
    }


    // Writes a Sheet to the pre-determined output
    writeSheet(sheet, config) {
        // no base path means no document yet, so we'll skip
        if (!this.basePath) {
            throw new Error("No output path provided.");
        }

        // SheetJS needs the objects to have only the properties we output
        // so we filter them here
        let fullData = this._filterDataBasedOnConfig(sheet.data); //[this._generateHeaderRow()].concat( sheet.data);
        // generate a list of headers in the right order
        let headers = this.mapping.columns.reduce((memo, {alias, name}) => {
            memo.aliases.push(alias);
            memo.names.push(name);
            return memo;
        }, {aliases: [], names: []})

        // generate the new sheet for the Excel document from the cleaned data
        const worksheet = XLSX.utils.json_to_sheet(fullData, {header: headers.aliases});

        // Set up the widths of the columns
        let columnWidths = this._generateColumnWidthConfig(headers.names, fullData).map(w => ({ wch: w }))
        // update the column widths
        worksheet["!cols"] = columnWidths;

        // Add human names to the headers
        XLSX.utils.sheet_add_aoa(worksheet, [headers.names], { origin: "A1" });


        // add the sheet to the output document
        XLSX.utils.book_append_sheet(this.workbook, worksheet, sheet.name);

        return;
    }

    _generateColumnWidthConfig(headers, rows) {
        // the output column widths
        let colWidths = [];
        for (let row of rows) {
            // we'll need the index here so use forEach
            Object.keys(row).forEach((k, i) => {
                // do we have any data in the columm?
                const rowLen = row[k] ? row[k].length : 0;
                colWidths[i] = Math.max(colWidths[i] || 0, rowLen);
            })
        }

        headers.forEach((header,i) => {
            colWidths[i] = Math.max(colWidths[i] || 0, header.length);
        })

        return colWidths;
    }
}

// Factory function for the xlsx encoder
function makeXlsxEncoder(mapping, options) {
    // TODO: validate encoder config here.
    return new XlsxEncoder(mapping, options);
}

module.exports = makeXlsxEncoder;