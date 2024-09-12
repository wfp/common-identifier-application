const path = require('node:path');
const fs = require('node:fs');


const { loadConfig, CONFIG_FILE_ENCODING }= require('./loadConfig');

const { loadAppConfig, saveAppConfig, DEFAULT_APP_CONFIG } = require('./appConfig');

// The current region name comes from the active algorithm
const { REGION } = require('../../active_algorithm');

const {appDataLocation} = require('./utils');

const APP_DIR_NAME = "CommonIDTool";
const CONFIG_FILE_NAME = `config.${REGION}.json`;
const APP_CONFIG_FILE_NAME = `appconfig.${REGION}.json`;

// the path of the application's data files
const APP_DIR_PATH = path.join(appDataLocation(), APP_DIR_NAME);

// the path of the store configuration file
const CONFIG_FILE_PATH = path.join(APP_DIR_PATH, CONFIG_FILE_NAME);

// the path of the application config file (containing config-independent settings)
const APP_CONFIG_FILE_PATH = path.join(APP_DIR_PATH, APP_CONFIG_FILE_NAME);

// TODO: if used without the app, this should be injected
const BACKUP_CONFIG_FILE_PATH = path.join(__dirname, "..", "..", "config.backup.toml");



// Ensure the application's config file directory exists
// TODO: export this bad boy to also use in the UI's logging path
function ensureAppDirectoryExists(appDir=APP_DIR_PATH) {
    if (!fs.existsSync(appDir)) {
        console.log("[CONFIG] Application directory '", appDir, "' does not exits -- creating it");
        // TODO: is doing this recursively worth it (the app dir should always be 1 level bellow a system directory)
        fs.mkdirSync(appDir /*, { recursive: true } */);
    }
}


// Attempts to save a configuration file to the designated location.
// This function does not do any validations on the data
// (that should have happened after loading the config)
// NOTE: the config is saved as JSON (TOML serialization can be weird)
function saveConfig(configData, outputPath) {
    // update the config hash on import to account for the
    const outputData = JSON.stringify(configData, null, "    ");
    fs.writeFileSync(outputPath, outputData, CONFIG_FILE_ENCODING );
    console.log("[CONFIG] Written config data to ", outputPath);
}

class ConfigStore {
    constructor() {

        this.data = {};
        this.validationResult = {};
        this.hasConfigLoaded = false;
        this.isValid = false;
        this.lastUpdated = new Date();

        // signal that the config we are using is
        // coming from the backup, not a user-provided one
        this.isUsingBackupConfig = false;

        this.appConfig = DEFAULT_APP_CONFIG;

    }


    getConfig() { return this.data; }



    // On boot we try to load the user config from AppData
    // or fall back to a backup config
    boot() {

        // attempt to load the application configuration
        this.appConfig = loadAppConfig(APP_CONFIG_FILE_PATH);

        // attempt to load the default app config
        const userConfigLoad = loadConfig(CONFIG_FILE_PATH);

        // if the load succesds we have a valid config -- use it as a
        // user-provided one
        if (userConfigLoad.success) {
            console.log("[CONFIG] User config validation success - using it as config")
            this.useUserConfig(userConfigLoad.config, userConfigLoad.lastUpdated);
            return;
        }

        console.log("[CONFIG] User config validation not successful - attempting to load backup config")
        // if the default config load failed use the backup default
        // from the app distribution
        const backupConfigLoad = loadConfig(BACKUP_CONFIG_FILE_PATH);

        // if the load succesds we have a valid config -- use it as
        // a config-from-backup
        if (backupConfigLoad.success) {
            console.log("[CONFIG] Backup config validation success - using it as config")
            backupConfigLoad.config.isBackup = true;
            this.useBackupConfig(backupConfigLoad.config);
            return;
        }

        // save the error
        this.loadError = backupConfigLoad.error;

        // if the backup config fails to load we are screwed
        console.log("[CONFIG] Backup config load failed - the application should alert the user: ", backupConfigLoad.error)

        // if there is a salt file error store the config, but act like it's invalid
        // (this is needed to pick up error messages from the config file)
        if (backupConfigLoad.isSaltFileError) {
            this.data = backupConfigLoad.config;
            this.hasConfigLoaded = false;
            this.isValid = false;
        } else {
            this.noValidConfig();
        }

    }

    // Attempts to update the contents of the current configuration file in
    // AppData with a user-provided config file.
    //
    // Returns nothing if successful, an error message string if failed.
    // The config data used by the application is updated after the save
    updateUserConfig(userConfigFilePath) {
        // attempt to load & validate the config data
        const userConfigLoad = loadConfig(userConfigFilePath);

        // if failed return the error message
        if (!userConfigLoad.success) {
            this.loadError = userConfigLoad.error;
            // TODO: what about salt errors?
            return userConfigLoad.error;
        }

        const userConfig = userConfigLoad.config;

        // sucessfully validated => we can write the config out
        this.saveNewConfigData(userConfig);
        // and use the new config data as the user config
        this.useUserConfig(userConfig, new Date());
    }

    // use a backup config and store its 'backupness'
    useBackupConfig(configData) {
        this.isUsingBackupConfig = true;
        this.lastUpdated = new Date();
        this._useConfig(configData);
    }

    // use an actual user-provided config and store its 'user-providedness'
    useUserConfig(configData, lastUpdateDate) {
        this.isUsingBackupConfig = false;
        this.lastUpdated = lastUpdateDate;
        this._useConfig(configData);
    }

    // signal that there is no valid config loaded (and were unable to load anything)
    noValidConfig() {
        this.data = {};
        this.hasConfigLoaded = false;
        this.isValid = false;
    }

    // use an already validated config as the app config
    _useConfig(configData) {
        this.data = configData;
        this.hasConfigLoaded = true;
        this.isValid = true;
    }


    // Overwrites the existing configuration file with the new data
    saveNewConfigData(configData) {
        // before saving ensure that we can save the configuration
        ensureAppDirectoryExists();
        // TODO: maybe do a rename w/ timestamp for backup
        // save the config to the output path
        saveConfig(configData, CONFIG_FILE_PATH);
    }

    // Overwrites the application configuration with the current
    // appConfig value.
    _saveAppConfig() {
        ensureAppDirectoryExists();
        saveAppConfig(this.appConfig, APP_CONFIG_FILE_PATH);
    }

    _currentSignature() {
        if (this.data && this.data.signature && this.data.signature.config_signature) {
            return this.data.signature.config_signature;
        }
        return "INVALID CONFIG, NO SIGNATURE"
    }

    // Marks the terms and conditions as accepted for the curent config hash
    // and saves the application config so the user doesn't have to accept it
    // anymore
    acceptTermsAndConditions() {
        this.appConfig.termsAndConditions[this._currentSignature()] = true;
        this._saveAppConfig();
    }

    // Returns true if the user has accepted the terms and conditions of the current
    // config (as indicated by the signature)
    hasAcceptedTermsAndConditions() {
        return (this.appConfig.termsAndConditions[this._currentSignature()] == true);
    }

}

function makeConfigStore() {
    return new ConfigStore();
}


module.exports = makeConfigStore;
