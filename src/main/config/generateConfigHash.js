const stableStringify = require('safe-stable-stringify');
const { createHash } = require('node:crypto');

const DEFAULT_HASH_TYPE = "md5";
const HASH_DIGEST_TYPE = "hex";

// Takes a config, removes the "signature" and salt keys from it, generates
// a stable JSON representation and hashes it using the provided algorithm
function generateConfigHash(config, hashType=DEFAULT_HASH_TYPE) {
    // create a nested copy of the object
    const configCopy = JSON.parse(JSON.stringify(config));;

    // remove the "signature" key
    delete configCopy.signature;

    // remove the "algorithm.salt" part as it may have injected keys
    // TODO: this enables messing with the salt file path pre-injection without signature validations, but is required for compatibility w/ the injection workflow
    delete configCopy.algorithm.salt.value;
    // mock the salt source as STRING to ensure that both imported and saved
    // (with pre-injected salt) config files work
    configCopy.algorithm.salt.source = "STRING";


    // generate a stable JSON representation
    const stableJson = stableStringify(configCopy);

    // console.log("STABLE JSON: ", stableJson);

    // generate the hash
    const hash = createHash(hashType).update(stableJson).digest(HASH_DIGEST_TYPE);

    return hash;
}



module.exports = generateConfigHash;