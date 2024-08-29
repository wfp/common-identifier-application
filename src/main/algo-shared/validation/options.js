
const ValidatorBase = require('./base');

const KIND_OPTIONS = "options"


class OptionsValidator extends ValidatorBase {
    constructor(values, opts) {
        super(KIND_OPTIONS, opts)
        this.values = values;
    }

    // the default message
    defaultMessage() {
        return `must be one of: "${this.values.join('", "')}"`;
    }

    // the core validation function that takes a field and returns nothing / a validationError
    validate(value) {
        if (this.values.indexOf(value) < 0) {
            return this.fail();
        }

        return this.success();
    }

}

// Factory function for the OptionsValidator
function makeOptionsValidator(opts) {
    let values = opts.value;

    // check if there is a regexp value
    if (!Array.isArray(values)) {
        throw new Error(`Options validator must have a 'value' with a list of values -- options are: ${JSON.stringify(opts)}`)
    }

    // return a new validator
    return new OptionsValidator(values, opts);
}

// export the factory function
module.exports = makeOptionsValidator;