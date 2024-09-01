
class ValidationError {
    constructor(kind, msg) {
        this.kind = kind;
        this.msg = msg;
    }

    // converts the validation error to a string for debugging purposes
    toString() {
        return `[${this.kind}]: ${this.msg}`
    }
}

module.exports = ValidationError;