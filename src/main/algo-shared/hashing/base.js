const crypto = require('node:crypto');
// USCADI uses RFC4648 base32 -- NodeJs has no default implementation for that
const base32 = require('hi-base32');




class BaseHasher {
    constructor(config) {
        this.config = config;

        // at this point the salt data should be injected into the config
        if (config.salt.source.toLowerCase() !== 'string') {
            throw new Error("only embedded salt values supported for hashing -- import & save the config if file support is desired here");
        }

        // load the salt value based on the config
        this.saltValue = config.salt.value;
        // this.saltValue = (config.salt.source.toLowerCase() === 'file') ?
        //     // importSaltFile(config.salt.value) :
        //     loadSaltFile(config.salt.value) :
        //     config.salt.value;
    }


    // Generates a hash based on the configuration from an already concatenated string
    // TODO: pass full algo config if SCRYPT or other more parameterized hash is used
    generateHash(stringValue, algorithm='sha256') {
        let hashDigest = crypto.createHash(algorithm).update(this.saltValue).update(stringValue).digest();
        return base32.encode(hashDigest);
    }

    generateHashForExtractedObject(extractedObj) {
        throw new Error("Hasher::generateHashForExtractedObject(obj) not implemented!")
    }
}

module.exports = BaseHasher