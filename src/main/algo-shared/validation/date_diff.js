const ValidatorBase = require('./base');
const dateFns = require("date-fns");

// the default format string
const DEFAULT_FORMAT_STR = "yyyyMMdd"

function parseDateDiff(dateDiffStr) {

    // figure out the range type
    let key = null;

    if (dateDiffStr.endsWith('M')) key = 'months';
    if (dateDiffStr.endsWith('Y')) key = 'years';
    if (dateDiffStr.endsWith('d')) key = 'days';

    if (!key) {
        return null;
    }

    // if there is a range parse the integer count
    const parsedInt = parseInt(dateDiffStr.substring(0, dateDiffStr.length - 1));

    // combine into a date-fn.sub() compatible format
    return { [key]: parsedInt, isPositive: (parsedInt >= 0) }

}

function isValidDateDiff(dateDiffString) {
    const dateDiff = parseDateDiff(dateDiffString);
    console.log("Date diff: ", dateDiff)
    return dateDiff;
}

function attemptToParseDate(value) {
    return dateFns.parse(value, DEFAULT_FORMAT_STR, new Date() );
    // TODO: implement me
    return new Date();
}

function isDateInRange(diff, value) {

    const targetDate = dateFns.add(new Date(), diff);
    const compareResult = dateFns.compareAsc(targetDate, value);

    // if the diff is positive the value must be before now + diff
    if (diff.isPositive) {
        // returns 1 if LEFT is after RIGHT
        return compareResult >= 0;
    } else {
        // returns 1 if LEFT is after RIGHT
        return compareResult <= 0;
    }
}

class DateDiffValidator extends ValidatorBase {
    constructor(dateDiff, opts) {
        super("dateDiff_check", opts)
        this.dateDiff = dateDiff;
        this.parsedDateDiff = parseDateDiff(dateDiff);
    }

    // the default message
    defaultMessage() {
        return `must be in the date range: ${this.dateDiff}`;
    }

    validate(value) {
        let parsedDate = attemptToParseDate(value);

        if (!parsedDate) {
            return this.failWith("must be a date: " + value);
        }

        if (!isDateInRange(this.parsedDateDiff, parsedDate)) {
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