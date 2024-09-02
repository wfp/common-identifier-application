const fs = require('node:fs');
const { attemptToReadTOMLData } = require('./utils');

const APP_CONFIG_ENCODING = 'utf-8';

const DEFAULT_APP_CONFIG = {
    // a map of <signature>:true values
    // that stores which config's termsAndConditions were accepted
    termsAndConditions: {},
    window: {
        // default window sizing
        width: 1024,
        height: 800,
    }
}

function loadAppConfig(configPath) {
    console.log("Loading Application config from", configPath);


    // attempt to read the file
    const configData = attemptToReadTOMLData(configPath, APP_CONFIG_ENCODING);

    // if cannot be read we assume default application configuration
    if (!configData) {
        console.log("Cannot find Application config file -- using the default");
        return DEFAULT_APP_CONFIG;
    }

    // validate the application config
    if (!configData.termsAndConditions ||
        !configData.window ||
        typeof configData.window.width !== 'number' ||
        typeof configData.window.height !== 'number'
    ) {
        console.log("Application config file is not valid -- using the default");
        return DEFAULT_APP_CONFIG
    }

    return configData;
}


function saveAppConfig(configData, outputPath) {

    // update the config hash on import to account for the
    const outputData = JSON.stringify(configData, null, "    ");
    fs.writeFileSync(outputPath, outputData, APP_CONFIG_ENCODING );
    console.log("Written Application config data to ", outputPath);
}


module.exports = {
    loadAppConfig,
    saveAppConfig,
    DEFAULT_APP_CONFIG,
}