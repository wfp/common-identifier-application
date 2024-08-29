const ValidatorBase = require('./base');

const KIND_REGEXP = "regexp"


class RegexpValidator extends ValidatorBase {
    constructor(rx, rxOpts, opts) {
        super(KIND_REGEXP, opts)
        // extract the regular expression
        this.regexp = rx;
        this.regexpOpts = rxOpts || "";

        // allocate the regular expression
        this.rx = new RegExp(wrapRegexpString(rx), rxOpts);
    }

    // the default message
    defaultMessage() {
        return `must match regular expression /^${this.regexp}$/${this.regexpOpts}`;
    }

    // the core validation function that takes a field and returns nothing / a validationError
    validate(value) {
        // check if the regexp matches
        if (this.rx.test(value)) {
            return this.success();
        }

        // fail if not
        return this.fail();
    }

}

// Returns the regexp string rx wrapped in "^...$" -- to ensure that the whole test string is checked
// TODO: this reduces regexp functionality but seems to be a WFP requirement
function wrapRegexpString(rx) {
    return `^${rx}$`;
}

// Factory function for the RegexpValidator
function makeRegexpValidator(opts) {
    let rx = opts.value;
    let rxOpts = opts.options;

    // check if there is a regexp value
    if (typeof rx !== 'string') {
        throw new Error(`Regexp validator must have a 'value' with a regexp -- options are: ${JSON.stringify(opts)}`)
    }

    // attempt to compile the regexp
    try {
        let regexp = new RegExp(wrapRegexpString(rx), opts.options);
    } catch(e) {
        // fail if invalid
        throw new Error(`Error while compiling regular expression: "${rx}" with options "${rxOpts}": ${e}`)
    }


    // return a new validator
    return new RegexpValidator(rx, rxOpts, opts);
}

// export the factory function
module.exports = makeRegexpValidator;