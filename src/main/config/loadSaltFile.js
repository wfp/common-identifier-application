const {
    attemptToReadFileData,
} = require('./utils');

// the encoding used for the salt file
const SALT_FILE_ENCODING = "utf-8";

// The default salt validator regexp, used for testing
const DEFAULT_VALIDATOR_REGEXP = /-----BEGIN PGP PUBLIC KEY BLOCK-----[A-Za-z0-9+/=\s]+-----END PGP PUBLIC KEY BLOCK-----/;

// Attempts to load and clean up the salt file data
function loadSaltFile(path, validatorRegexp=DEFAULT_VALIDATOR_REGEXP) {
    // return null;
    // TODO: potentially clean up line endings and whitespace here
    const saltData = attemptToReadFileData(path, SALT_FILE_ENCODING);
    if (!saltData) return;

    // check if the structure is correct for the file
    // /-----BEGIN PGP PUBLIC KEY BLOCK-----[A-Za-z0-9+/=\s]+-----END PGP PUBLIC KEY BLOCK-----/
    const CHECK_RX = new RegExp(validatorRegexp);

    if (!CHECK_RX.test(saltData)) {
        console.log("SALT FILE Regexp error")
        return null;
    }

    console.log("SALT FILE looks OK")
    return saltData;
}

module.exports = loadSaltFile;