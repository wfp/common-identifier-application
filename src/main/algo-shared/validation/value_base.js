
const ValidatorBase = require('./base');

// A base validator class that takes a predicate (that returns true / false for
// a value) and wraps it up in a validator
class ValueValidatorBase extends ValidatorBase {
    constructor(name, defaultMessage, predicate, opts) {
        super(name, opts);
        this.predicate = predicate;
        this._defaultMessage = defaultMessage;
    }

    // the default message
    defaultMessage() {
        return this._defaultMessage;
    }

    validate(value) {
        return this.predicate(value) ? this.success() : this.fail();
    }

}

// Factory function that takes a predicate and creates a validator out of it
function makeValueValidator(name, defaultMessage, predicate, opts) {
    return new ValueValidatorBase(name, defaultMessage, predicate, opts);
}

module.exports = makeValueValidator;