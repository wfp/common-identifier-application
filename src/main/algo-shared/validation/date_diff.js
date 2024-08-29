const ValidatorBase = require('./base');

function isValidDateDiff(dateDiffString) {
    // TODO: implement me
    return true;
}

function attemptToParseDate(value) {
    // TODO: implement me
    return new Date();
}

function isDateInRange(diff, value) {
    // TODO: implement me
    return true
}

class DateDiffValidator extends ValidatorBase {
    constructor(dateDiff, opts) {
        super("dateDiff_check", opts)
        this.dateDiff = dateDiff;
    }

    // the default message
    defaultMessage() {
        return `must be in the date range: ${this.dateDiff}`;
    }

    validate(value) {
        let parsedDate = attemptToParseDate(value);

        if (!parsedDate) {
            return this.failWith("must be a date");
        }

        if (!isDateInRange(this.dateDiff, parsedDate)) {
            return this.fail();
        }

        return this.success();
    }

}

// Factory function for the DateDiffValidator
function makeDateDiffValidator(opts) {
    let dateDiff = opts.value;

    // check if there is a regexp value
    if (typeof dateDiff !== 'string') {
        throw new Error(`DateDiff validator must have a 'value' with the date difference as a string -- ${JSON.stringify(opts)}`)
    }

    // TODO: validate the date diff format here
    if (!isValidDateDiff(dateDiff)) {
        throw new Error(`'${dateDiff}' is not a valid date difference`)
    }

    // return a new validator
    return new DateDiffValidator(dateDiff, opts);
}

// export the factory function
module.exports = makeDateDiffValidator;