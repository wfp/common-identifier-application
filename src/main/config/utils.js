const fs = require('node:fs');
const toml = require('toml');


// Tries to read the file data, returns null if unsuccessful
function attemptToReadFileData(filePath, encoding) {
    try {
        return fs.readFileSync(filePath, encoding);
    }
    catch (e) {
        return null;
    }

}

// Tries to read the file data decoded from TOML, returns null if unsuccessful
function attemptToReadTOMLData(filePath, encoding) {
    try {
        const fileData = fs.readFileSync(filePath, encoding);

        // handle TOML
        if (filePath.toLowerCase().endsWith('.toml')) {
            return toml.parse(fileData);
        }

        // handle JSON
        if (filePath.toLowerCase().endsWith('.json')) {
            return JSON.parse(fileData);
        }

        // unknown enxtension
        return null;

    }
    catch (e) {
        return null;
    }

}


module.exports = {
    attemptToReadFileData,
    attemptToReadTOMLData,
}