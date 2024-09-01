const path = require('node:path');
const os = require('node:os');

const { Sheet, Document } = require('./document');

// inject used algo here
let {makeHasher} = require('../active_algorithm');

const {encoderForFile} = require('./encoding');
const {decoderForFile, fileTypeOf} = require('./decoding');
const validation = require("./validation");

const {extractAlgoColumnsFromObject} = require('./hashing/utils');


// Generate the hash columns from the row object
function generateHashForRow(algorithmConfig, uscadi, rowObject) {
    let extractedObj = extractAlgoColumnsFromObject(algorithmConfig.columns, rowObject);
    let res = uscadi.generateHashForExtractedObject(extractedObj);
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
