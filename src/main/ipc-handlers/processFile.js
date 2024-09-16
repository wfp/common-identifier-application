const path = require('node:path');
const { dialog } = require('electron')
const {baseFileName} = require('../util');

// The actual processing function called after the output path is selected
function doProcessFile(mainWindow, configStore, inputFilePath, outputPath, processing) {
    const config = configStore.getConfig();
    const limit = undefined;
    let outputFormat = undefined;
    let outputBasePath = outputPath;
    // figure out the output path
    const extension = path.extname(outputPath);
    // we may need to use the extension-less output path (if we replace the extension)
    const basePath = path.join(path.dirname(outputPath), path.basename(outputPath, path.extname(outputPath)));

    switch (extension.toLowerCase()) {
        case ".xlsx":
            outputFormat = ".xlsx";
            outputBasePath = basePath;
            break;
        case ".csv":
            outputFormat = ".csv";
            outputBasePath = basePath;
            break;
    }

    // console.log("===== using:", { outputFormat, outputBasePath })

    return processing.processFile(config, outputBasePath, inputFilePath, limit, outputFormat)
        .then((result) => {
            console.log("[IPC] [processFile] PROCESSING DONE")
            mainWindow.webContents.send('processingDone', result)
        });
}




// Process a file
function processFile({mainWindow, configStore, filePath, processing}) {

    // TODO: maybe assume the file is already valid?
    console.log('=========== Processing File:', filePath);



    return dialog.showSaveDialog({
        defaultPath: baseFileName(filePath),
    }).then(function (response) {
        if (response.canceled || response.filePath === '') {
            // TODO: send cancel signal
            console.log("[IPC] [processFile] no file selected");
            // send the canceled message
            mainWindow.webContents.send('processingCanceled', {});
            return
        }

        const outputPath = response.filePath;
        console.log("[IPC] [processFile] STARTING TO PROCESS AS", outputPath);
        return doProcessFile(mainWindow, configStore, filePath, outputPath, processing);
    });


}


module.exports = processFile;