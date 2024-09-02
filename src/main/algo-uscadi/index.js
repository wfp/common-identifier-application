
const transliterateWord = require('./transliteration');
const ar2SafeBwMap = require('./transliteration-mapping-ar2safebw');

const makeArabicSoundexEngine = require('./arabic-soundex');
const doubleMetaphone = require('./double-metaphone');


// the soundex engine we'll use
let arabicSoundexEngine = makeArabicSoundexEngine();

const {joinFieldsForHash, cleanValueList} = require('../algo-shared/hashing/utils');

const BaseHasher = require('../algo-shared/hashing/base');


// USCADI implementation that takes the extracted ('static', 'to_translate', 'reference')
// and returns a hashed object
class UscadiHasher extends BaseHasher {

    constructor(config) {
        super(config);
    }

    // Builds the hash columns from the extracted row object
    generateHashForExtractedObject(extractedObj) {
        return {
            "USCADI": generateHash(this, extractedObj, composePersonalHashSource),
            "document_hash": generateHash(this, extractedObj, composeReferenceHashSource),

            // for debugging the hash
            "USCADI_src": composePersonalHashSource(extractedObj),
            "document_hash_src": composeReferenceHashSource(extractedObj),
        }
    }


}


// Generates a transliteration, metaphone and soundex for a string
function translateValue(value) {
    // clean the column value
    let cleanedValue = cleanNameColumn(value);
    // transliterate the value
    const transliteratedStr = transliterateWord(cleanedValue, ar2SafeBwMap);
    // package the output
    return {
        transliterated: transliteratedStr,
        transliteratedMetaphone: doubleMetaphone(transliteratedStr)[0],
        soundex: arabicSoundexEngine.soundex(cleanedValue)
    }
}



// cleans a single value in a name column (whitespace and other)
function cleanNameColumn(value) {
    // remove all whitespace and digits from all name fields
    let cleaned = value.replaceAll(/[\s]+/g, "")
        .replaceAll(/[\d]+/g, "")
    // for names with Arabic letters, run the following regex replacements
    // ة becomes ه
    cleaned = cleaned.replaceAll("ة", "ه");
    // any of: أ  ئ ؤ ء ى becomes ا
    cleaned = cleaned.replaceAll(/أئؤءى/g, "ا");

    return cleaned;
}


// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "static" and the translated "to_translate" parts
// concatednated as per the USCADI spec
function composePersonalHashSource(extractedObj) {
    // the static fields stay the same
    // while the to_translate fields are translated

    let translatedValues = extractedObj.to_translate.map(translateValue);
    let staticValues = extractedObj.static;

    // The original USCADI algorithm seems to concatenate the translated values
    // by grouping them by concatenating per-type:
    // [_mp1_value, _mp2_value, ... , _sx1_value, _sx2_value, ...]
    let {metaphone, soundex} = translatedValues.reduce((memo, val) => {
        memo.metaphone.push(val.transliteratedMetaphone);
        memo.soundex.push(val.soundex);

        return memo;
    }, { metaphone:[], soundex:[] })

    // concat them
    // TODO: check the order
    let concatenated = joinFieldsForHash(cleanValueList(staticValues.concat(metaphone, soundex)));

    return concatenated;
}

// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "refernce" parts concatednated as per the USCADI
// spec
function composeReferenceHashSource(extractedObj) {
    return joinFieldsForHash(cleanValueList(extractedObj.reference));
}



// Helper that generates a hash based on a concatenation result
function generateHash(hasher, extractedObj, collectorFn) {
    // collect the data for hashing
    const collectedData = collectorFn(extractedObj);

    // if there is an empty string only, return an empty string (no hash)
    if (collectedData === '') {
        return '';
    }
    // if there is data generate a hash
    // return collectorFn(uscadi, extractedObj);
    return hasher.generateHash(collectedData);
}






function makeUscadiHasher(config) {
    // TODO: config check
    switch (config.hash.strategy.toLowerCase()) {
        case 'sha256':
            return new UscadiHasher(config);
            // return new Sha256Hasher(config);
        default:
            throw new Error(`Unknown hash strategy in config: '${config.hash.strategy}'`);
    }
}



module.exports = {
    makeHasher: makeUscadiHasher,
    REGION: 'NWS',
}