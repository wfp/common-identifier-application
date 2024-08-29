const ValidatorBase = require('./base');
const makeValueValidator = require("./value_base");

function makeMaxValueValidator(opts) {
    let maxValue = opts.value;

    // check if there is a regexp value
    if (typeof maxValue !== 'number') {
        throw new Error(`MinValue validator must have a 'value' with a number -- ${JSON.stringify(opts)}`)
    }

    return makeValueValidator("min_value", `must be at most ${maxValue}`, (v) => {
        // attempt to convert to a number
        let numericValue = parseFloat(v);
        // not a number is a failed validation
        if (isNaN(numericValue)) {
            return false;
        }

        return numericValue <= maxValue;

    }, opts);
}

// export the factory function
module.exports = makeMaxValueValidator;
