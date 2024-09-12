const fs = require('node:fs');
const os = require('node:os');
const path = require('node:path');
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

// takes into consideration the platform and the type of value provided by the config
// to return an actual, absolute salt file path
function getSaltFilePath(saltValueConfig) {
    // if the value is a string always use it
    if (typeof saltValueConfig === 'string') {
        return saltValueConfig
    }

    let platformSaltPath = saltValueConfig[process.platform];

    // no salt path means the config does not have our platform
    if (!platformSaltPath) {
        throw new Error("Not supported platform for salt file location:", process.platform);
    }

    // token replacement
    return path.resolve(
            platformSaltPath.replaceAll('$HOME', os.homedir())
                            .replaceAll('$APPDATA', appDataLocation()));
}


// Returns the prefered Application Data storage location based on the operating system
function appDataLocation() {
    return process.env.APPDATA || (process.platform == 'darwin' ? process.env.HOME + '/Library/Preferences' : process.env.HOME + "/.local/share")
}



module.exports = {
    attemptToReadFileData,
    attemptToReadTOMLData,
    getSaltFilePath,
    appDataLocation,
}