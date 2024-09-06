const toml = require('toml');
const {Document, Sheet} = require('../document')
const ValidationError = require('./ValidationError')

// MAIN VALIDATION
// ---------------

// Validates a single value with a list of validators.
// The row is passed to allow for cross-column checks
function validateValueWithList(validatorList, value, row) {
    return validatorList.reduce((memo, validator) => {
        // check if the validator says OK
        let result = validator.validate(value, row);
        // if failed add to the list of errors
        if (result) {
            memo.push(result);
        }
        return memo;
    }, [])
}

function validateRowWithListDict(validatorListDict, row) {
    // check if all expected columns are present
    let missingColumns = Object.keys(validatorListDict).map((k) => {
        return (typeof row[k] === 'undefined') ? k : null;
    }).filter(v => v);

    // Fail if there are missing columns
    if (missingColumns.length > 0) {
        return missingColumns.reduce((memo, c) => {
            return Object.assign(memo, {[c]: [new ValidationError('SCHEMA', 'is missing')]})
        }, {});
    }

    // TODO: should all columns in the validatorListDict checked or base it on the row?
    return Object.keys(row).reduce((memo, fieldName) => {
        // check if there is a validatorList for the field
        let validatorList = validatorListDict[fieldName];
        // if not skip this column
        if (!Array.isArray(validatorList)) {
            return memo;
        }

        let fieldValue = row[fieldName];

        // use the validators
        memo[fieldName] = validateValueWithList(validatorList, fieldValue, row);

        return memo;
    }, {})
}

// VALIDATOR FACTORY
// ------------------

const regexpValidatorFactory = require('./regexp');
const optionsValidatorFactory = require('./options');

const makeMaxFieldLengthValidator = require('./max_field_length');
const makeFieldTypeValidator = require('./field_type');
const makeLanguageCheckValidator = require('./language_check');

const makeMinValueValidator = require('./min_value');
const makeMaxValueValidator = require('./max_value');

const makeDateDiffValidator = require('./date_diff');
const makeDateFieldDiffValidator = require('./date_field_diff');

const VALIDATOR_FACTORIES = {
    // Regexp validators have a number of possible names (for ease of use)
    "regex": regexpValidatorFactory,
    "regexp": regexpValidatorFactory,
    "regex_match": regexpValidatorFactory,

    "options": optionsValidatorFactory,

    "max_field_length": makeMaxFieldLengthValidator,

    "field_type": makeFieldTypeValidator,

    "language_check": makeLanguageCheckValidator,

    "min_value": makeMinValueValidator,
    "max_value": makeMaxValueValidator,

    "date_diff": makeDateDiffValidator,
    "date_field_diff": makeDateFieldDiffValidator,
};


// Factory function to create a validator from an options object.
//
// Uses the 'op' value in the object to match the type based on the
// VALIDATOR_FACTORIES dictionnary
function makeValidator(opts) {
    // check if there is an 'op' in the object
    let op = opts.op;
    if (typeof op !== 'string') {
        throw new Error(`Validator configuration is missing the 'op' field: ${JSON.stringify(opts)}`);
    }

    // check if there is a value for the key in the factory object
    let validatorFactory = VALIDATOR_FACTORIES[op];
    if (typeof validatorFactory !== 'function') {
        throw new Error(`Cannot find validator for type: '${op}'`);
    }

    // if yes use the factory function
    return validatorFactory(opts);
}

// Takes a list of validator options and creates a list of validators from it
function makeValidatorList(optsList) {
    return optsList.map(makeValidator);
}

// Takes a dict of <field name> => <list of validator option dicts> Dict and
// returns a map of <field name> => <validator list>.
//
// This function merges the "*" field validations into each field's validator list
function makeValidatorListDict(validationOpts) {
    // the "*" field denotes validators targeting all fields
    let allFieldValidators = validationOpts["*"];

    // TODO: check if this covers all cases of missing "*" validators list
    if (!Array.isArray(allFieldValidators)) {
        allFieldValidators = [];
    }

    //
    return Object.keys(validationOpts).reduce((memo, field) => {
        // if the field is the "*" skip this bit
        if (field === "*") {
            return memo;
        }

        // check if the validator options are an array for the current field
        let fieldValidatorOpts = validationOpts[field];
        if (!Array.isArray(fieldValidatorOpts)) {
            throw new Error(`Expected a list of validator options for the field '${field}' -- got: ${JSON.stringify(fieldValidatorOpts)}`);
        }

        // construct the list of validators for the field from the current
        // and the "*" validator options
        let fullValidatorOptions = fieldValidatorOpts.concat(allFieldValidators);
        let validatorList = makeValidatorList(fullValidatorOptions);

        // assign it to the object
        memo[field] = validatorList;


        return memo;
    }, {})
}

//////////////////////////////////////////////////////////////////////

function test() {
    var fs = require('fs');

    let config = toml.parse(fs.readFileSync("config.toml", 'utf-8'));

    let DATA = [
        {
            dob_year: 1970,
            category: "CASH-MPA",
            amount: 2500,
        },
        {
            dob_year: 1972,
            category: "CASH-RENT",
            amount: 15000,
        },
        {
            dob_year: 12,
            category: "ASDASODHU",
            amount: 129313,
        },
        {
            dob_year: 2025,
            category: 12345,
            amount: 1,
        },
    ];

    let validatorDict = makeValidatorListDict(config.validations);

    DATA.forEach(row => {
        let results = validateRowWithListDict(validatorDict, row);
        console.log("ROW: \t", row, "\n", results, "\n--------------")
    })

}

// Validates a full document with the pre-generated validator list dict
function validateDocumentWithListDict(validatorDict, document) {
    let results = document.sheets.map((sheet) => {
        let results = sheet.data.map((row) => {
            // do the actual validation
            let results = validateRowWithListDict(validatorDict, row);
            let compactResults = Object.keys(results).reduce((memo, col) => {
                let colResults = results[col];
                if (colResults.length > 0) {
                    memo.push({ column: col, errors: colResults });
                }
                return memo;
            }, []);
            // to know if the whole row is valid check every column in the results
            let ok = Object.keys(results).reduce((memo, col) => {
                return memo && results[col].length === 0;
            }, true);
            // package it up
            return { row, ok: compactResults.length === 0, errors: compactResults };
        });
        return {
            sheet: sheet.name,
            ok: !results.some((res) => !res.ok),
            results
        };
    });

    return results;
}

// Generates a document for output based on the validation results.
// sourceConfig is required to map the original column names in the error messages
function makeValidationResultDocument(sourceConfig, results) {

    let fieldNameMapping = sourceConfig.columns.reduce((memo, col) => {
        return Object.assign(memo, {[col.alias]: col.name})
    }, {});


    return new Document(results.map((sheetResult) => {

        return new Sheet(sheetResult.sheet, sheetResult.results.map((rowResult, rowIdx) => {
            // build an error message
            let errorList = rowResult.errors.map((error) => {

                // find the column name
                let columnHumanName = fieldNameMapping[error.column] || error.column;
                return error.errors.map((err) => {
                    return `${columnHumanName} ${err.msg}`
                }).join(", ")
            });


            // combine with the row onject
            return Object.assign({
                row_number: rowIdx + 1,
                errors: errorList.join("\n"),
            }, rowResult.row)
        }));
    }));
}

module.exports = {
    makeValidatorListDict,
    // validateRowWithListDict,
    validateDocumentWithListDict,

    makeValidationResultDocument,
}