
// File type constants
const FILE_CSV = ".csv";
const FILE_XLSX = ".xlsx";

// The data class describing a sheet
class Sheet {
    constructor(name, data) {
        this.name = name;
        this.data = data;
    }
}

// The data class describing a document with many sheets
class Document {
    constructor(sheets) {
        this.sheets = sheets;
    }
}

module.exports = {
    Sheet, Document,
    FILE_CSV, FILE_XLSX,
}