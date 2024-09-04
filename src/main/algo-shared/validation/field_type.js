const ValidatorBase = require('./base');

const FIELD_TYPE_NAMES = {
    str: "text",
    num: "number",
}

const FIELD_TYPE_MATCHERS = {
    str: (v) => typeof v === 'string',
    num: (v) => typeof v === 'number',
}

class FieldTypeValidator extends ValidatorBase {
    constructor(fieldType, opts) {
        super("field_type", opts)
        this.fieldType = fieldType;
    }

    // the default message
    defaultMessage() {
        return `must be of type: ${FIELD_TYPE_NAMES[this.fieldType]}`;
    }

    validate(value) {
        return FIELD_TYPE_MATCHERS[this.fieldType](value) ? this.success() : this.fail();
    }

}

// Factory function for the FieldTypeValidator
function makeFieldTypeValidator(opts) {
    let fieldType = opts.value;

    // check if there is a regexp value
    if (typeof fieldType !== 'string') {
        throw new Error(`FieldType validator must have a 'value' with the field type -- ${JSON.stringify(opts)}`)
    }

    // ensure compatibilty
    fieldType = fieldType.toLowerCase();

    // check if there is a regexp value
    let matcher = FIELD_TYPE_MATCHERS[fieldType];
    if (!matcher) {
        throw new Error(`Cannot find field type: '${fieldType}' for field_type validator`)
    }

    // return a new validator
    return new FieldTypeValidator(fieldType, opts);
}

// export the factory function
module.exports = makeFieldTypeValidator;