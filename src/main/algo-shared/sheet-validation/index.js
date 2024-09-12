// Column validators use the same error type (as they need to be displayed in the
// table for each row)
const ValidationError = require('../validation/ValidationError');
const ValidatorBase = require('../validation/base');
// Column-based


// The Sheet validator is like a validatorbase, but uses a different validation method
class SheetValidatorBase extends ValidatorBase {

    constructor(kind, opts) {
        super(kind, opts)
    }

    // Validates the sheet data. Gets passed the entired
    validateSheet(sheetData) {
        throw new Error(`Not implemented`)
    }


    validate(value, row) {
        throw new Error("validate() is not used for SheetValidators")
    }

}

// Validator that checks that every value in a column is the same value
class FieldValuesEqualColumnValidator extends SheetValidatorBase {

    constructor(columnName, opts) {
        super("filed_values_equal", opts);
        this.columnName = columnName;
    }

    // the default message
    defaultMessage() {
        return `the column '${this.columnName}' must have a single value in the whole input`;
    }


    validateSheet(sheetData) {

        // zero rows always OK
        if (sheetData.length === 0) {
            return this.success();
        }

        // the target value is the first row's value
        const targetValue = sheetData[0][this.columnName]

        for(let row of sheetData) {
            // if the
            if (row[this.columnName] != targetValue) {
                return this.failWith(`expected '${targetValue}', but found '${row[this.columnName]}'`)
            }
        }

        // if no rows failed we succeeded
        return this.success();
    }
}

