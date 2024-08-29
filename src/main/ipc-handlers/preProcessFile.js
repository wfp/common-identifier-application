
function fileDropped({mainWindow, configStore, filePath, processing}) {

    console.log('Dropped File:', filePath);

    const config = configStore.getConfig();
    const limit = undefined;

    return processing.preprocessFile(config, filePath, limit).then(({
        inputData,
        validationResultDocument,
        validationResult,
        validationErrorsOutputFile
    }) => {
        console.log("PREPROCESSING DONE")
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