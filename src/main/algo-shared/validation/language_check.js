const ValidatorBase = require('./base');

function checkArabicUtf8(v) {
    // As of Unicode 15.1, the Arabic script is contained in the following blocks:[3]

    // Arabic (0600–06FF, 256 characters)

    // Arabic Supplement (0750–077F, 48 characters)
    // Arabic Extended-B (0870–089F, 41 characters)
    // Arabic Extended-A (08A0–08FF, 96 characters)

    // Arabic Presentation Forms-A (FB50–FDFF, 631 characters)
    // Arabic Presentation Forms-B (FE70–FEFF, 141 characters)

    // Rumi Numeral Symbols (10E60–10E7F, 31 characters)

    // Arabic Extended-C (10EC0-10EFF, 3 characters)

    // Indic Siyaq Numbers (1EC70–1ECBF, 68 characters)

    // Ottoman Siyaq Numbers (1ED00–1ED4F, 61 characters)

    // Arabic Mathematical Alphabetic Symbols (1EE00–1EEFF, 143 characters)

    const RX_BASE = [
        "a-z",
        "A-Z",
        "0-9",
        "()\\-",
        "\\s",
        "\u0600-\u06ff",

        "\u0750-\u077f",
        "\u0870-\u089f",
        "\u08a0-\u08ff",

        "\ufb50-\ufdff",
        "\ufe70-\ufeff",

        // TODO: somehow add ones above 10xxx
    ];

    const validatorRx = new RegExp(`^[${RX_BASE.join('')}]*$`)

    return validatorRx.test(v);


}

const CHECKER_FNS = {
    "arabic": checkArabicUtf8,
}

class LanguageCheckValidator extends ValidatorBase {
    constructor(language, opts) {
        super("language_check", opts)
        this.language = language;
    }

    // the default message
    defaultMessage() {
        return `must be in the language '${this.language}'`;
    }

    validate(value) {
        return CHECKER_FNS[this.language](value) ? this.success() : this.fail();
    }

}

// Factory function for the LanguageCheckValidator
function makeLanguageCheckValidator(opts) {
    let language = opts.value;

    // check if there is a regexp value
    if (typeof language !== 'string') {
        throw new Error(`LanguageCheck validator must have a 'value' with language name as string -- ${JSON.stringify(opts)}`)
    }

    // ensure compatibilty
    language = language.toLowerCase();


    // check if there is a regexp value
    let matcher = CHECKER_FNS[language.toLowerCase()];
    if (!matcher) {
        throw new Error(`Cannot find field type: '${language}' for field_type validator`)
    }

    // return a new validator
    return new LanguageCheckValidator(language, opts);
}

// export the factory function
module.exports = makeLanguageCheckValidator;