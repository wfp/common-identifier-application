
// Modules to control application life and create native browser window
const { app, BrowserWindow, ipcMain } = require('electron/main')
const { dialog, shell } = require('electron')
const path = require('node:path')

const { resolveHtmlPath, baseFileName } = require('./util')

const processing = require('./algo-shared/processing')
const makeConfigStore = require('./algo-shared/config/ConfigStore');

// IPC event handlers
const requestConfigUpdate = require("./ipc-handlers/requestConfigUpdate");
const loadNewConfig = require('./ipc-handlers/loadNewConfig');
const preProcessFile = require('./ipc-handlers/preProcessFile');
const processFile = require('./ipc-handlers/processFile');
const preProcessFileOpenDialog = require('./ipc-handlers/preProcessFileOpenDialog');
const removeUserConfig = require('./ipc-handlers/removeUserConfig');

const createDesktopShortcut = require('create-desktop-shortcuts');

// INITIAL SQUIRELL EVENT HANDLING
// -------------------------------



// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    // squirrel event handled and app will exit in 1000ms, so don't do anything else
    return;
}

function handleSquirrelEvent() {

    if (process.argv.length === 1) {
      return false;
    }

    const ChildProcess = require('child_process');
    const path = require('path');

    const appFolder = path.resolve(process.execPath, '..');
    const rootAtomFolder = path.resolve(appFolder, '..');
    const updateDotExe = path.resolve(path.join(rootAtomFolder, 'Update.exe'));
    const exeName = path.basename(process.execPath);
    const exePath = process.execPath;

    const spawn = function(command, args) {
      let spawnedProcess, error;

      try {
        spawnedProcess = ChildProcess.spawn(command, args, {detached: true});
      } catch (error) {}

      return spawnedProcess;
    };

    const spawnUpdate = function(args) {
      return spawn(updateDotExe, args);
    };

    const squirrelEvent = process.argv[1];
    switch (squirrelEvent) {
      case '--squirrel-install':
      case '--squirrel-updated':
        // Optionally do things such as:
        // - Add your .exe to the PATH
        // - Write to the registry for things like file associations and
        //   explorer context menus
        const shortcutsCreated = createDesktopShortcut({
            // OPTIONAL: defaults to true
            onlyCurrentOS: true,
            // OPTIONAL: defaults to true
            verbose: true,
            windows: {
                filePath: exePath,
                outputPath: appFolder,
                name: 'Building Blocks CommonID Tool',
                comment: 'Start the CommonID Tool',
                // icon: 'C:\\path\\to\\file.ico',
                // arguments: '--my-argument -f \'other stuff\'',
                // windowMode: 'normal',
                // hotkey: 'ALT+CTRL+F'
            },
        })

        // // Install desktop and start menu shortcuts
        // spawnUpdate(['--createShortcut', exeName]);

        // setTimeout(app.quit, 1000);
        return true;

      case '--squirrel-uninstall':
        // Undo anything you did in the --squirrel-install and
        // --squirrel-updated handlers

        // Remove desktop and start menu shortcuts
        // spawnUpdate(['--removeShortcut', exeName]);

        // setTimeout(app.quit, 1000);
        return true;

      case '--squirrel-obsolete':
        // This is called on the outgoing version of your app before
        // we update to the new version - it's the opposite of
        // --squirrel-updated

        app.quit();
        return true;
    }
}







function createMainWindow(configStore) {

    // figure out the existing window configuration
    const appConfig = configStore.appConfig;
    const { width, height } = appConfig.window;

    // Create the browser window.
    const mainWindow = new BrowserWindow({
        width,
        height,

        // constrain the layout
        minWidth: 880,
        minHeight: 640,

        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: true
        },
        autoHideMenuBar: true
    });

    return mainWindow;
}

function createWindow() {

    const configStore = makeConfigStore();
    // start loading the config here
    configStore.boot();

    const mainWindow = createMainWindow(configStore);

    // and load the index.html of the app.
    mainWindow.loadURL(resolveHtmlPath('renderer.html'))

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()


    return {mainWindow, configStore};
}

// Registers all handlers for the window
function registerIpcHandlers({mainWindow, configStore, processing}) {
    function withErrorReporting(delegate) {
        // catch errors that bubble up es exceptions and convert them to rejections
        return new Promise(function(resolve, reject) {
            try { resolve(delegate()); }
            catch (e) { reject(e); }
        }).catch(e => {
            // catch errors that bubble up as rejections
            console.error("INTERNAL ERROR:", e);
            mainWindow.webContents.send('error', e.toString());
        });
    }

    // Event handlers
    // --------------

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
            return processFile({mainWindow, configStore, filePath, processing});
        });
    });

    // open and process a file using an open file dialog
    ipcMain.on('preProcessFileOpenDialog', (event, _) => {
        return withErrorReporting(() => {
            return preProcessFileOpenDialog({mainWindow, configStore, processing})
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

    // mark the terms and conditions accepted
    ipcMain.on('acceptTermsAndConditions', () => {
        configStore.acceptTermsAndConditions();
    });

    // CONFIG-RELATED
    // --------------

    // Handle dropping of files
    ipcMain.handle('requestConfigUpdate', (_) => {
        return requestConfigUpdate({configStore})
    });

    ipcMain.handle('loadNewConfig', (_) => {
        return loadNewConfig({configStore});
    });

    ipcMain.handle('removeUserConfig', (_) => {
        return removeUserConfig({configStore});
    })

}


// Unregisters all Elecron IPCMain IPC / event handlers to eansure that closed
// windows have no stuck event handlers.
function unregisterIpcHandlers() {
    // Event handlers
    // --------------

    [
       "fileDropped",
       "processFile",
       "preProcessFileOpenDialog",
       "openOutputFile",
       "quit",
       "acceptTermsAndConditions",
    ].forEach(channel => ipcMain.removeAllListeners(channel));

    // IPC functions
    // -------------
    [
        "requestConfigUpdate",
        "loadNewConfig",
        "removeUserConfig",
    ].forEach(channel => ipcMain.removeHandler(channel));
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
    function createAndRegisterWindow() {
        const {mainWindow, configStore} = createWindow();

        registerIpcHandlers({mainWindow, configStore, processing})
    }

    createAndRegisterWindow();

    app.on('activate', () => {
        // On macOS it's common to re-create a window in the app when the
        // dock icon is clicked and there are no other windows open.
        if (BrowserWindow.getAllWindows().length === 0) {
            // don't want any stuck handlers on macOS
            unregisterIpcHandlers();
            // re-create the window and the config store
            createAndRegisterWindow();
        }
    })
})


// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})


