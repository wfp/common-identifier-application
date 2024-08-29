const { dialog } = require('electron')

function loadNewConfig({configStore}) {


        console.log("App requested loading a new config")

        return dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: "All config files", extensions: ["toml", "json"] },
                {name: "TOML files", extensions: ["toml"] },
                {name: "JSON files", extensions: ["json"] },
            ],
        }).then((response) => {
            if (!response.canceled) {
                // handle fully qualified file name
                const filePath = response.filePaths[0];
                console.log("Starting to load config file from open dialog:", filePath);

                // attempt to load into the store
                const loadError = configStore.updateUserConfig(filePath);

                if (!loadError) {
                    return {
                        success: true,
                        config: configStore.getConfig(),
                        lastUpdated: configStore.lastUpdated,
                    };
                }

                console.log("CONFIG LOAD ERROR:", loadError)
                return {
                    success: false,
                    canceled: false,
                    error: loadError,
                    config: configStore.getConfig(),
                }

            } else {
                return {
                    success: false,
                    canceled: true,
                    config: configStore.getConfig(),
                };
            }
        });

}

module.exports = loadNewConfig;