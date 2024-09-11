const { REGION } = require('../active_algorithm');

// enums with the validation result
const CONFIG_IS_VALID = "ConfigIsValid";
const CONFIG_IS_INVALID = "ConfigIsInvalid";
const CONFIG_SALT_FILE_IS_INVALID = "ConfigSaltFileIsInvalid";


function validateConfig(config) {

    function isObject(label, v) {
        if (typeof v !== "object") return `Missing ${label}`;
    }

    function isNumber(label, v) {
        if (typeof v !== "number") return `${label} must be a number`;
    }

    function isString(label, v) {
        if (typeof v !== "string") return `${label} must be a string`;
    }

    function isStringList(label, v) {
        if (!Array.isArray(v)) return `${label} must be a string array`;

        if (v.some(e => typeof e !== 'string')) {
            return `${label} must contain strings`;
        }
    }

    function isOneOf(label, values, v) {
        if (values.indexOf(v) < 0) return `${label} must be one of ${values}`
    }

    function isArrayOf(label, pred, v) {
        if (!Array.isArray(v)) return `${label} must be an array`;

        const result = v.find(pred);
        if (result) {
            return `${label}${pred(result)}`;
        }
    }

    function isValidRegexp(label, v) {
        try {
            let _ = new RegExp(v);
        } catch (e) {
            return `${label} is not a valid JavaScript Regular Expression`
        }
    }

    // Generic column mapping
    // ----------------------
    function checkColumnMapping(label, columnMappingObject) {
        return isObject(label, columnMappingObject) ||
            isArrayOf(label + ".columns", (c) => (
                isObject("", c) ||
                isString(".name", c.name) ||
                isString(".alias", c.alias)
            ), columnMappingObject.columns);
    }


    // Meta
    // ----

    function checkMeta(meta) {
        // check if this is the correct region
        if (meta.region != REGION) {
            return `meta.region is not '${REGION}'`
        }

        return isObject("meta", meta) ||
            isString("meta.version", meta.version) ||
            isString("meta.region", meta.region);
    }

    // Source & destinations
    // ---------------------

    function checkSource(source) {
        return checkColumnMapping("source", source);
    }

    function checkDestination(label, destination) {
        return checkColumnMapping(label, destination) ||
            isString(`${label}.postfix`, destination.postfix);
    }

    // Validations
    // -----------

    function checkValidations(validations) {
        if (typeof validations !== 'object') return `validations must be an object`;

        // check each key
        return Object.keys(validations).reduce((memo, k) => {
            if (memo) return memo;

            return isArrayOf(`validations.${k}`, (v) => (
                isObject("", v) ||
                isString(".op", v.op) ||
                // value is either a number or a string
                (isString(".value", v.value) &&
                    isNumber(".value", v.value) &&
                    isStringList(".value", v.value))
            ),validations[k])
        }, null)

    }

    // Algorithm
    // ---------

    function checkAlgorithm(algorithm) {
        // check if there is a salt
        if (typeof algorithm !== "object")
            return "Missing algorithm";

        function checkAlgorithmHash(algorithmHash) {
            return isObject("algorithm.hash", algorithmHash) ||
                isOneOf("algorithm.hash.strategy", ["SHA256", "SCRYPT", "ARGON2"], algorithmHash.strategy)
                // TODO: algorithm parameters that are dependent on the algorithm choice
        }

        function checkAlgorithmColumns(algorithmColumns) {
            return isObject("algorithm.columns", algorithmColumns) ||
                isStringList("algorithm.columns.to_translate", algorithmColumns.to_translate) ||
                isStringList("algorithm.columns.reference", algorithmColumns.static) ||
                isStringList("algorithm.columns.reference", algorithmColumns.reference);
        }

        function checkAlgorithmSalt(algorithmSalt) {
            // // check if there is a salt
            // if (typeof algorithmSalt !== "object")
            //     return "Missing algorithm.salt";

            const saltValidationError = isObject("algorithm.salt", algorithmSalt) ||
                isString("algorithm.salt.validator_regex", algorithmSalt.validator_regex) ||
                isValidRegexp("algorithm.salt.validator_regex", algorithmSalt.validator_regex)

            if (saltValidationError) {
                return saltValidationError;
            }

            switch (algorithmSalt.source) {
                case "FILE":
                    // the salt value is either a string or has basic platform suppport
                    return isString("algorithm.salt.value", algorithm.salt.value) &&
                    (
                        isObject("algorithm.salt.value", algorithm.salt.value) ||
                        isString("algorithm.salt.value.win32", algorithm.salt.value.win32) ||
                        isString("algorithm.salt.value.darwin", algorithm.salt.value.darwin)
                    );
                case "STRING":
                    return isString("algorithm.salt.value", algorithm.salt.value);
                default:
                    return "Unknown algorithm.salt.source";

            }
        }

        // check the salt
        return checkAlgorithmColumns(algorithm.columns) ||
            checkAlgorithmHash(algorithm.hash) ||
            checkAlgorithmSalt(algorithm.salt);


    }


    function checkSignature(signature) {
        return isObject("signature", signature) ||
            isString("signature.config_signature", signature.config_signature);
    }

    function checkMessages(messages) {
        return isObject("messages", messages) ||
            isString("messages.error_in_config", messages.error_in_config) ||
            isString("messages.error_in_salt", messages.error_in_salt) ||
            isString("messages.terms_and_conditions", messages.terms_and_conditions);

    }

    return checkMeta(config.meta) ||
        checkSource(config.source) ||
        checkValidations(config.validations) ||
        checkAlgorithm(config.algorithm) ||
        checkDestination("destination", config.destination) ||
        checkDestination("destination_map", config.destination_map) ||
        checkDestination("destination_errors", config.destination_errors) ||
        checkSignature(config.signature) ||
        checkMessages(config.messages)
        ;
}

module.exports = validateConfig;