
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron/main')
const { dialog, shell } = require('electron')
const path = require('node:path')

const { resolveHtmlPath, baseFileName } = require('./util')

const processing = require('./algo-shared/processing')
const makeConfigStore = require('./config/ConfigStore');

// IPC event handlers
const requestConfigUpdate = require("./ipc-handlers/requestConfigUpdate");
const loadNewConfig = require('./ipc-handlers/loadNewConfig');
const preProcessFile = require('./ipc-handlers/preProcessFile');
const processFile = require('./ipc-handlers/processFile');
const preProcessFileOpenDialog = require('./ipc-handlers/preProcessFileOpenDialog');

const createWindow = () => {

    const configStore = makeConfigStore();
    // start loading the config here
    configStore.boot();

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width: 1024,
        height: 800,

        // constrain the layout
        minWidth: 880,
        minHeight: 640,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        }
    })

    // and load the index.html of the app.
    mainWindow.loadURL(resolveHtmlPath('renderer.html'))




    // Open the DevTools.
    // mainWindow.webContents.openDevTools()


    function withErrorReporting(delegate) {
        return new Promise(function(resolve, reject) {
            resolve(delegate());
        }).catch(e => {
            console.error("INTERNAL ERROR:", e);
            mainWindow.webContents.send('error', e.toString());
        });
    }

    // CONFIG-RELATED
    // --------------

    // Handle dropping of files
    ipcMain.handle('requestConfigUpdate', (_) => {
        return requestConfigUpdate({configStore})
    });

    ipcMain.handle('loadNewConfig', (_) => {
        return loadNewConfig({configStore});
    })


    // PROCESSING-RELATED
    // ------------------

    // Handle dropping of files
    ipcMain.on('fileDropped', (_, filePath) => {
        return withErrorReporting(() => {
            return preProcessFile({mainWindow, configStore, filePath, processing})
        });
    })

    // Start processing the file
    ipcMain.on('processFile', (event, filePath) => {
        return withErrorReporting(() => {
            processFile({mainWindow, configStore, filePath, processing});
        });
    });

    // open and process a file using an open file dialog
    ipcMain.on('preProcessFileOpenDialog', (event, _) => {
        return withErrorReporting(() => {
            preProcessFileOpenDialog({mainWindow, configStore, processing})
        });
    });

    // MISC
    // ----

    // open a file with the OS default app
    ipcMain.on('openOutputFile', (event, filePath) => {
        shell.openPath(filePath);
    });

    // quit when receiving the 'quit' signal
    ipcMain.on('quit', () => {
        app.quit();
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


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


