
// MAPPING-ONLY COLUMNS
// --------------------

// The following code is a direct copy from the algo-shared/processing/mappingRequiredColumns.js
// (mixing node and frontend code for such simple pieces is not worth it because of the problems it can cause)



// Returns a list of columns that are used for the hashing (according to the configuration provided)
// this can be used to figure out if an input document is an assistance document or a mapping document
function algorithmRequiredColumns(algorithmConfig) {
    const columnsConfig = algorithmConfig.columns;
    // TODO: is this erorr handling even needed here?
    if (typeof columnsConfig !== 'object') {
        console.log("[PROCESSING] Unable to find column configuration for algorithm.")
        return [];
    }
    // We simply concat the input columns from the config (or use an empty list as default)
    return [].concat(
        (columnsConfig.to_translate || []),
        (columnsConfig.static || []),
        (columnsConfig.reference || []),
    )
}

function columnsPresentInBothSourceAndMapping(sourceConfig, destinationMapConfig) {
    const sourceAliases = new Set(sourceConfig.columns.map(c => c.alias));
    return destinationMapConfig.columns.map(c => c.alias).filter(c => sourceAliases.has(c));
}


// Returns a list of columns containing both algorithm-required and "always-include" columns
// (effectively merging data from the two config sections of algorithm and columns).
export function mappingRequiredColumns(config) {
    const algorithmColumns = algorithmRequiredColumns(config.algorithm);
    // const alwaysIncludeColumns = columnsIncludedInMapping(config.source);
    const alwaysIncludeColumns = columnsPresentInBothSourceAndMapping(config.source, config.destination_map);

    return Array.from(new Set([...algorithmColumns, ...alwaysIncludeColumns]))
}

export function filterColumnConfigForMapping(config, columnsConfig) {
        // get a list of column aliases that are needed by the mapping
        const mappingNeededColumns = new Set(mappingRequiredColumns(config));
        // filter the existing output column list
        return columnsConfig.filter(({alias}) => mappingNeededColumns.has(alias))
}