const ValidatorBase = require('./base');

const KIND_MAXFIELDLENGTH = "maxFieldLength"


class MaxFieldLengthValidator extends ValidatorBase {
    constructor(maxLen, opts) {
        super(KIND_MAXFIELDLENGTH, opts)
        this.maxLen = maxLen;
    }

    // the default message
    defaultMessage() {
        return `must be shorter than ${this.maxLen} digits / characters`;
    }

    validate(value) {
        // must be a string
        if (typeof value !== 'string') {
            if (typeof value === 'number') {
                value = value.toString();
            } else {
                return this.failWith("must be a string or a number");
            }
        }

        return value.length > this.maxLen ? this.fail() : this.success();
    }

}

// Factory function for the MaxFieldLengthValidator
function makeMaxFieldLengthValidator(opts) {
    let maxLen = opts.value;

    // check if there is a regexp value
    if (typeof maxLen !== 'number') {
        throw new Error(`MaxFieldLength validator must have a 'value' with number -- ${JSON.stringify(opts)}`)
    }

    // return a new validator
    return new MaxFieldLengthValidator(maxLen, opts);
}

// export the factory function
module.exports = makeMaxFieldLengthValidator;