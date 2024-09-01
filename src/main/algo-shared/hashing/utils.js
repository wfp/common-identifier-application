

// takes an row object and the "algorithm.columns" config and returns a new
// object with { static: [<COL VALUES>], to_translate: [..], reference: [...] } columns
function extractAlgoColumnsFromObject(columnConfig, obj) {
    // check if we have an actual config
    if (typeof columnConfig !== "object") {
        throw new Error("Invalid algorithm columns config");
    }

    // the config values we care about
    let groups = ["static", "to_translate", "reference"];
    let output = {};

    // go through the groups
    for (let groupName of groups) {
        let colNames = columnConfig[groupName];
        // check if this is an array
        if (!Array.isArray(colNames)) {
            throw new Error(`invalid algorithm config: cannot find column group '${groupName}'`);
        }

        let colValues = colNames.map((colName) => {
            let extractedValue = obj[colName];
            return extractedValue;
        });

        output[groupName] = colValues;
    }

    return output;
}


// Centralized helper to join different parts of a field value list
function joinFieldsForHash(fieldValueList) {
    return fieldValueList.join("");
}

// Returns a cleaned version (null and undefined values removed)
// TODO: implement this based on WFP feedback
function cleanValueList(fieldValueList) {
    return fieldValueList.map((v) => typeof v === 'string' ? v : "")
}



module.exports = {
    joinFieldsForHash,
    cleanValueList,
    extractAlgoColumnsFromObject,
}
