
function fileDropped({mainWindow, configStore, filePath, processing}) {

    console.log('[IPC] [fileDropped] Dropped File:', filePath);

    const config = configStore.getConfig();
    const limit = undefined;

    return processing.preprocessFile(config, filePath, limit).then((result) => {
        console.log("[IPC] [fileDropped] PREPROCESSING DONE")
        mainWindow.webContents.send('preprocessingDone', Object.assign({
            inputFilePath: filePath,
        }, result)
        )
    });

}


module.exports = fileDropped;