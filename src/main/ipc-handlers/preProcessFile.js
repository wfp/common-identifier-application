
function fileDropped({mainWindow, configStore, filePath, processing}) {

    console.log('[IPC] [fileDropped] Dropped File:', filePath);

    const config = configStore.getConfig();
    const limit = undefined;

    return processing.preprocessFile(config, filePath, limit).then(({
        inputData,
        validationResultDocument,
        validationResult,
        validationErrorsOutputFile
    }) => {
        console.log("[IPC] [fileDropped] PREPROCESSING DONE")
        mainWindow.webContents.send('preprocessingDone', {
            inputFilePath: filePath,
            inputData: inputData,
            validationResult: validationResult,
            validationErrorsOutputFile,
            validationResultDocument,
        })
    });

}


module.exports = fileDropped;