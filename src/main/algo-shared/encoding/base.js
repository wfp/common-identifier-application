const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
const { lightFormat } = require("date-fns");

// Name formatting via Date-Fns lightformat.
// TOKEN GUIDE: https://date-fns.org/v3.6.0/docs/lightFormat
function formatName(name, date) {
    return name.replace(/\{\{(.*?)\}\}/, (match, capture) => {
        let formatString = match.slice(2, -2);
        return lightFormat(date, formatString);
    })
}

// Moves a file (uses fs.rename and falls back to fs.copyFile between FS bounds)
function moveFile(oldPath, newPath) {
    // Create the output directory
    fs.mkdirSync(path.dirname(newPath), { recursive: true });

    try {
        // Attempt to rename the file
        fs.renameSync(oldPath, newPath);
    } catch (err) {
        // error may indicate that the paths are on different file systems
        // so check for that and copy as a fallback
        if (err.code === 'EXDEV') {
            // Copy the file
            fs.copyFileSync(oldPath, newPath);
            // Delete the old file
            fs.unlinkSync(oldPath);
        } else {
            // re-throw the error
            throw err;
        }
    }
}

class EncoderBase {

    constructor(mapping) {
        this.mapping = mapping;
        // add every file path the encoder has written to this array
        this.outputPaths = [];
    }


    // internal helper to return a full name (with a timestamp according to the config)
    _getOutputNameFor(baseFileName) {
        let fullName = `${baseFileName}${this.mapping.postfix}`;
        // TODO: add logic from config
        return formatName(fullName, new Date())
        // return baseFileName;
    }

    _generateHeaderRow() {
        return this.mapping.columns.reduce((memo, col) => {
            return Object.assign(memo, { [col.alias] : col.name });
        },{})
    }


    // Starts the wiriting of a new document (could be a single output file or multiple)
    startDocument(document, outputPath, options={}) {
        throw new Error("not implemented");
    }

    // Ends wiriting the document
    endDocument(document) {
        throw new Error("not implemented");
    }


    // Writes a Sheet to the pre-determined output
    writeSheet(sheet, config) {
        throw new Error("not implemented");
    }


    // Wraps encoding a whole document using this encoder.
    // Returns the list of files output
    encodeDocument(document, outputPath, options={}, sheetConfig={}) {
        // start the document
        this.startDocument(document, outputPath, options);

        // write all sheets to the document
        document.sheets.forEach((sheet, i) => {
            // write the sheet and allow the writer to know how many sheets are there
            this.writeSheet(sheet, sheetConfig, {
                current: i,
                length: document.sheets.length,
            });
        });

        // end the document
        this.endDocument(document);

        return this.outputPaths;
    }


    // Attempts to filter out the columns that should not be present in the
    _filterDataBasedOnConfig(data) {
        // build a set of keys
        let keysArray = this.mapping.columns.map((col) => col.alias);
        // let keysSet = new Set(keysArray);
        return data.map((row) => {
            return keysArray.reduce((newRow, k) => {
                return Object.assign(newRow, { [k]: row[k] });
            }, {})
        })
    }

    _withTemporaryFile(outputPath, pred) {

        const temporaryFilePath = path.join(os.tmpdir(), path.basename(outputPath));

        // call the predicate with the temporary file path so it can write the output
        pred(temporaryFilePath);

        // move to the final output location
        moveFile(temporaryFilePath, outputPath);
        console.log("[ENCODING] Moved output to final location:", outputPath);

    }

}

module.exports = EncoderBase;