
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron/main')
const { dialog, shell } = require('electron')
const path = require('node:path')

const { resolveHtmlPath } = require('./util')

const processing = require('./ALGO-NWS/processing')
// const Config = require('./ALGO-NWS/config');
const makeConfigStore = require('./ALGO-NWS/config/ConfigStore');

const createWindow = () => {

    const configStore = makeConfigStore();
    // start loading the config here
    configStore.boot();

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(resolveHtmlPath('index.html'))




    // Open the DevTools.
    mainWindow.webContents.openDevTools()


    // CONFIG-RELATED
    // --------------

    // Handle dropping of files
    ipcMain.handle('requestConfigUpdate', (event) => {
        console.log('App requesting config udpate');
        // return the data
        return {
            config: configStore.getConfig(),
            isBackup: configStore.isUsingBackupConfig,
            lastUpdated: configStore.lastUpdated,
            error: configStore.loadError,
        }
    });

    ipcMain.handle('loadNewConfig', (event) => {

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
                console.log("LOAD ERROR:", loadError)

                if (!loadError) {
                    return {
                        success: true,
                        config: configStore.getConfig(),
                        lastUpdated: configStore.lastUpdated,
                    };
                }

                return {
                    success: false,
                    canceled: false,
                    error: loadError,
                }

            } else {
                return {
                    success: false,
                    canceled: true,
                };
            }
        });

    })


    // PROCESSING-RELATED
    // ------------------

    // Handle dropping of files
    ipcMain.on('fileDropped', (event, filePath) => {
        console.log('Dropped File:', filePath);
        // event.returnValue = `Received ${arg.length} paths.`; // Synchronous reply
        preprocessFileImpl(filePath);
    })

    function preprocessFileImpl(filePath) {

        const config = configStore.getConfig();
        const limit = undefined;

        processing.preprocessFile(config, filePath, limit).then(({inputData, validationResult, validationErrorsOutputFile}) => {

            console.log("PREPROCESSING DONE")
            mainWindow.webContents.send('preprocessingDone', {
                inputFilePath: filePath,
                inputData: inputData,
                validationResult: validationResult,
                validationErrorsOutputFile,
            })
        });
    }

    function processFileImpl(filePath) {

        // TODO: maybe assume the file is already valid?
        console.log('=========== Processing File:', filePath);
        // event.returnValue = `Received ${arg.length} paths.`; // Synchronous reply


        function doProcessFile(outputPath) {
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

            console.log("===== using:", {outputFormat, outputBasePath})

            // TODO: open a path picker
            // const outputPath = "/tmp/";

            processing.processFile(config, outputBasePath, filePath, limit, outputFormat)
                .then(({ outputData, outputFilePath }) => {

                    console.log("!!!! PROCESSING DONE")
                    mainWindow.webContents.send('processingDone', {
                        outputData,
                        outputFilePath,
                    })
                });
        }

        dialog.showSaveDialog({
            defaultPath: baseFileName(filePath),
        }).then(function (response) {
            if (response.canceled || response.filePath === '') {
                // TODO: send cancel signal
                console.log("no file selected");
                // send the cancelec message
                mainWindow.webContents.send('processingCanceled', {});
                return
            }

            const selectedFile = response.filePath;
            console.log("STARTING TO PROCESS AS", selectedFile);
            doProcessFile(selectedFile);
                // handle fully qualified file name
        });


    }

    // Start processing the file
    ipcMain.on('processFile', (event, filePath) => {
        processFileImpl(filePath)
    });

    // open and process a file using an open file dialog
    ipcMain.on('preProcessFileOpenDialog', (event, _) => {

        dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [
                {name: "CSV or XLSX files", extensions: ["csv", "xlsx" ] },
            ],
        }).then((response) => {
            if (!response.canceled) {
                // handle fully qualified file name
                const filePath = response.filePaths[0];
                console.log("Starting to process file from open dialog:", filePath);
                preprocessFileImpl(filePath)
            } else {
                console.log("no file selected");
                // send the cancelec message
                mainWindow.webContents.send('processingCanceled', {});
            }
        });
    });

    // open a file with the OS default app
    ipcMain.on('openOutputFile', (event, filePath) => {
        shell.openPath(filePath);
    });

}


// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', () => {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})


// ipcMain.on('dropped-file', (event, arg) => {
//     console.log('Dropped File(s):', arg);
//     event.returnValue = `Received ${arg.length} paths.`; // Synchronous reply
// })

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})



// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    const lastComponent = splitName[splitName.length - 1].split(/\.+/);
    return lastComponent.slice(0,-1).join('.')
}
