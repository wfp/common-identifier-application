
// Removes the user configuration and falls back to the built-in default
function removeUserConfig({configStore}) {

    console.log("[IPC] [removeUserConfig] start")

    const loadError = configStore.removeUserConfig();

    console.log("[IPC] [removeUserConfig] result:", loadError);

    //
    if (!loadError) {
        return {
            success: true,
            config: configStore.getConfig(),
            lastUpdated: configStore.lastUpdated,
        };
    }

    return {
        success: false,
        // canceled: false,
        error: loadError,
        // config: configStore.getConfig(),
    }


}


module.exports = removeUserConfig;