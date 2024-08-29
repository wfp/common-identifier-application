const path = require('node:path');
const os = require('node:os');

const { Sheet, Document } = require('./document');

// inject used algo here
let {makeHasher} = require('../active_algorithm');

const {encoderForFile} = require('./encoding');
const {decoderForFile, fileTypeOf} = require('./decoding');
const validation = require("./validation");

// takes an row object and the "algorithm.columns" config and returns a new
// object with { static: [<COL VALUES>], to_translate: [..], reference: [...] } columns
function extractAlgoColumnsFromObject(columnConfig, obj) {
    // check if we have an actual config
    if (typeof columnConfig !== "object") {
        throw new Error("Invalid algorithm columns config");
    }

    // the config values we care about
    let groups = ["static", "to_translate", "reference"];
    let output = {};

    // go through the groups
    for (let groupName of groups) {
        let colNames = columnConfig[groupName];
        // check if this is an array
        if (!Array.isArray(colNames)) {
            throw new Error(`invalid algorithm config: cannot find column group '${groupName}'`);
        }

        let colValues = colNames.map((colName) => {
            let extractedValue = obj[colName];
            return extractedValue;
        });

        output[groupName] = colValues;
    }

    return output;
}


// Centralized helper to join different parts of a field value list
function joinFieldsForHash(fieldValueList) {
    return fieldValueList.join("");
}

// Returns a cleaned version (null and undefined values removed)
// TODO: implement this based on WFP feedback
function cleanValueList(fieldValueList) {
    return fieldValueList.map((v) => typeof v === 'string' ? v : "")
}

// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "refernce" parts concatednated as per the USCADI
// spec
function composeReferenceHashSource(uscadi, extractedObj) {
    return joinFieldsForHash(cleanValueList(extractedObj.reference));
}


// Takes the output of `extractAlgoColumnsFromObject` (extracted properties) and
// return a string with the "static" and the translated "to_translate" parts
// concatednated as per the USCADI spec
function composePersonalHashSource(uscadi, extractedObj) {
    // returnst true if all values are present
    function hasAllValuesPresent(list, nameList) {
        return list.some((v) => typeof v !== 'string' && typeof v !== 'number');
    }

    if (false) {
        // check to see if all values of static and to_translate are present
        if (!hasAllValuesPresent(extractedObj.to_translate) || !hasAllValuesPresent(extractedObj.static)) {
            // TODO: what is the desired thing here?
            throw new Error(`Row is missing some expected values for hashing: '${extractedObj}'`);
        }
    }

    // the static fields stay the same
    // while the to_translate fields are translated

    let translatedValues = extractedObj.to_translate.map((val) => uscadi.translateValue(val));
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

// Builds the hash columns from the extracted row object
function generateHashForExtractedObject(uscadi, extractedObj) {
    // Helper that generates a hash based on a concatenation result
    function generateHash(collectorFn) {
        // collect the data for hashing
        const collectedData = collectorFn(uscadi, extractedObj);

        // if there is an empty string only, return an empty string (no hash)
        if (collectedData === '') {
            return '';
        }
        // if there is data generate a hash
        // return collectorFn(uscadi, extractedObj);
        return uscadi.generateHash(collectedData);
    }

    return {
        "USCADI": generateHash(composePersonalHashSource),
        "document_hash": generateHash(composeReferenceHashSource),

        // for debugging the hash
        "USCADI_src": composePersonalHashSource(uscadi, extractedObj),
        "document_hash_src": composeReferenceHashSource(uscadi, extractedObj),
    }
}


// Generate the hash columns from the row object
function generateHashForRow(algorithmConfig, uscadi, rowObject) {
    let extractedObj = extractAlgoColumnsFromObject(algorithmConfig.columns, rowObject);
    let res = generateHashForExtractedObject(uscadi, extractedObj);
    return res;
}

function generateHashesForSheet(algorithmConfig, uscadi, sheet) {
    // generate for all rows
    let rows = sheet.data.map((row) => {
        let generatedHashes = generateHashForRow(algorithmConfig, uscadi, row);

        return Object.assign({}, row, generatedHashes);
    });

    return new Sheet(sheet.name, rows);
}


function generateHashesForDocument(algorithmConfig, uscadi, document) {
    // generate for all rows
    let sheets = document.sheets.map((sheet) => {
        return generateHashesForSheet(algorithmConfig, uscadi, sheet);
    });

    return new Document(sheets);
}

// Helper that saves a document with the prefered config
function outputDocumentWithConfig(basePath, outputFileType, destinationConfig, document) {

    let encoderFactoryFn = encoderForFile(outputFileType);
    let encoder = encoderFactoryFn(destinationConfig, {});

    return encoder.encodeDocument(document, basePath);
}


// return true if the validation was successful
function isDocumentValid(validationResult) {
    return !validationResult.some(sheet => !sheet.ok);
}

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    const lastComponent = splitName[splitName.length - 1].split(/\.+/);
    return lastComponent.slice(0,-1).join('.')
}



async function preprocessFile(config, inputFilePath, limit) {
    console.log("------------ preprocessFile -----------------")

    // the input file path
    // let inputFilePath = program.args[0];
    let inputFileType = fileTypeOf(inputFilePath);

    if (!inputFileType) {
        throw new Error("Unknown input file type");
    }

    // DECODE
    // ======

    // find a decoder
    let decoderFactoryFn = decoderForFile(inputFileType);
    let decoder = decoderFactoryFn(config.source);

    // decode the data
    let decoded = await decoder.decodeFile(inputFilePath);


    // apply limiting if needed
    if (limit) {
        console.log("[LOAD] Using input row limit: ",  limit);
        decoded.sheets[0].data = decoded.sheets[0].data.slice(0, limit);
    }


    // VALIDATION
    // ==========
    let validatorDict = validation.makeValidatorListDict(config.validations);
    let validationResult = validation.validateDocumentWithListDict(validatorDict, decoded);


    let validationErrorsOutputFile;
    let validationResultDocument;

    if (!isDocumentValid(validationResult)) {

        // check if validation is ok -- if yes write the file out
        validationResultDocument = validation.makeValidationResultDocument(config.source, validationResult);

        // The error file is output to the OS's temporary directory
        const errorOutputBasePath = path.join(os.tmpdir(), baseFileName(inputFilePath));

        validationErrorsOutputFile = outputDocumentWithConfig(errorOutputBasePath, inputFileType, config.destination_errors, validationResultDocument);
        // ensure that we only return a single value
        if (validationErrorsOutputFile.length > 0) {
            validationErrorsOutputFile = validationErrorsOutputFile[0];
        }
    }

    return {
        inputData: decoded,
        validationResultDocument,
        validationResult,
        validationErrorsOutputFile: validationErrorsOutputFile,
    };

}


async function processFile(config, ouputPath, inputFilePath, limit, format) {
    console.log("------------ preprocessFile -----------------")



    // the input file path
    let inputFileType = fileTypeOf(inputFilePath);

    if (!inputFileType) {
        throw new Error("Unknown input file type");
    }

    // DECODE
    // ======

    // find a decoder
    let decoderFactoryFn = decoderForFile(inputFileType);
    let decoder = decoderFactoryFn(config.source);

    // decode the data
    let decoded = await decoder.decodeFile(inputFilePath);


    // apply limiting if needed
    if (limit) {
        console.log("[LOAD] Using input row limit: ",  limit);
        decoded.sheets[0].data = decoded.sheets[0].data.slice(0, limit);
    }


    // VALIDATION
    // ==========
    let validatorDict = validation.makeValidatorListDict(config.validations);
    let validationResult = validation.validateDocumentWithListDict(validatorDict, decoded);


    // HASHING
    // =======
    let hasher = makeHasher(config.algorithm);
    let result = generateHashesForDocument(config.algorithm, hasher, decoded)


    // OUTPUT
    // ------

    // if the user specified a format use that, otherwise use the input format
    const outputFileType = format || inputFileType;

    // helper to output a document with a specific config
    function outputDocumentWithConfig(destinationConfig, document) {

        let basePath = ouputPath;

        let encoderFactoryFn = encoderForFile(outputFileType);
        let encoder = encoderFactoryFn(destinationConfig, {});

        return encoder.encodeDocument(document, basePath);
    }
    // console.log(JSON.stringify(result, null, "    "))

    // output the base document
    let mainOutputFiles = outputDocumentWithConfig(config.destination, result);
    // output the mapping document
    let mappingFilePaths = outputDocumentWithConfig(config.destination_map, result);

    return {
        // inputData: decoded,
        outputData: result,
        outputFilePaths: mainOutputFiles,
        mappingFilePaths,
    };


}

module.exports = {
    preprocessFile,
    processFile,
}
