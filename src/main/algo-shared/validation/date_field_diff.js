
const ValidatorBase = require('./base');

const { parseDateDiff, isValidDateDiff, attemptToParseDate, isDateInRange } = require('./date_shared');

class DateFieldDiffValidator extends ValidatorBase {
    constructor(dateDiff, targetField, opts) {
        super("dateFieldDiff_check", opts)
        this.targetField = targetField;
        this.dateDiff = dateDiff;
        this.parsedDateDiff = parseDateDiff(dateDiff);
    }

    // the default message
    defaultMessage() {
        const { _key, _value } = this.parsedDateDiff;
        return `must be in the date range compared to '${this.targetField}': ${_value} ${_key}`;
    }

    validate(value, row) {

        let otherFieldValue = row[this.targetField];
        // if there is no other field value fail
        if (!otherFieldValue) {
            this.failWith(`target column '${this.targetField}' is empty`)
        }

        let originDate = attemptToParseDate(otherFieldValue);

        if (!originDate) {
            return this.failWith(`target column '${this.targetField}' must be a date: ${value}`);
        }

        let currentFieldDate = attemptToParseDate(value);

        if (!currentFieldDate) {
            return this.failWith("must be a date: " + value);
        }

        console.log("Comparing:", {pd: this.parsedDateDiff, currentFieldDate, originDate})
        if (!isDateInRange(this.parsedDateDiff, originDate, currentFieldDate)) {
            return this.fail();
        }

        return this.success();
    }

}

// Factory function for the DateDiffValidator
function makeDateFieldDiffValidator(opts) {
    let dateDiff = opts.value;
    let targetField = opts.target;

    // check if there is a target field specified
    if (typeof targetField !== 'string') {
        throw new Error(`DateFieldDiff validator must have a 'target' with the target column name -- ${JSON.stringify(opts)}`)
    }


    // check if there is a date diff value
    if (typeof dateDiff !== 'string') {
        throw new Error(`DateFieldDiff validator must have a 'value' with the date difference as a string -- ${JSON.stringify(opts)}`)
    }

    // TODO: validate the date diff format here
    if (!isValidDateDiff(dateDiff)) {
        throw new Error(`'${dateDiff}' is not a valid date difference`)
    }

    // return a new validator
    return new DateFieldDiffValidator(dateDiff, targetField, opts);
}

// export the factory function
module.exports = makeDateFieldDiffValidator;