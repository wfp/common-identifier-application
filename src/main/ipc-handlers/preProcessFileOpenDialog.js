const { dialog } = require('electron')
const preProcessFile = require('./preProcessFile');

// Shows a file open dialog and starts preprocessing the selected file
function preProcessFileOpenDialog({ mainWindow, configStore, processing}) {

    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: "CSV or XLSX files", extensions: ["csv", "xlsx"] },
        ],
    }).then((response) => {
        if (!response.canceled) {
            // handle fully qualified file name
            const filePath = response.filePaths[0];
            console.log("Starting to process file from open dialog:", filePath);
            preProcessFile({mainWindow, configStore, filePath, processing});
        } else {
            console.log("no file selected");
            // send the cancelec message
            mainWindow.webContents.send('processingCanceled', {});
        }
    });
}

module.exports = preProcessFileOpenDialog;