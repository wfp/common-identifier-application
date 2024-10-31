/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain } from 'electron/main'
import { shell } from 'electron'
import { dirname, join, resolve } from 'node:path'
import { fileURLToPath } from 'node:url';

import { resolveHtmlPath } from './util.js'
import { ConfigStore, makeConfigStore } from './algo-shared/config/configStore.js'

// IPC event handlers
import { requestConfigUpdate } from "./ipc-handlers/requestConfigUpdate.js"
import { loadNewConfig } from './ipc-handlers/loadNewConfig.js'
import { preProcessFile } from './ipc-handlers/preProcessFile.js'
import { processFile } from './ipc-handlers/processFile.js'
import { preProcessFileOpenDialog } from './ipc-handlers/preProcessFileOpenDialog.js'
import { removeUserConfig } from './ipc-handlers/removeUserConfig.js'

import { handleSquirrelEvent, createDesktopShortcut } from './squirell-callbacks.js'

const __dirname = dirname(fileURLToPath(import.meta.url));

// INITIAL SQUIRELL EVENT HANDLING
// -------------------------------

// this should be placed at top of main.js to handle setup events quickly
if (handleSquirrelEvent()) {
    process.exit();
} else {

    // Always attempt to create the shortcut to hopefully allow OneDrive
    // Desktop shorcut creation on reinstall
    createDesktopShortcut();
}

function createMainWindow(configStore: ConfigStore) {

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
            preload: join(__dirname, 'preload.mjs'),
            contextIsolation: true,
            nodeIntegration: true,
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

    // set the icon on windows (setting the icon to a .ico file on Mac results in a throw)
    if (process.platform === "win32") {
        mainWindow.setIcon(`${resolve(__dirname, '../../assets/logo.ico')}`);
    }
    else if (process.platform === "darwin") {
        // MacOS requires a PNG (it does not seem to like ICNS here, but only accepts ICNS
        // for the packaging) + changing this line does not seem to change the
        mainWindow.setIcon(`${resolve(__dirname, '../../assets/logo.png')}`);
    }

    // Open the DevTools.
    // mainWindow.webContents.openDevTools()


    return {mainWindow, configStore};
}

interface IPCRegisterHandlersInput {
    mainWindow: BrowserWindow;
    configStore: ConfigStore;
}

// Registers all handlers for the window
function registerIpcHandlers({mainWindow, configStore}: IPCRegisterHandlersInput) {
    function withErrorReporting(delegate: CallableFunction) {
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
            return preProcessFile({mainWindow, configStore, filePath})
        });
    })

    // Start processing the file
    ipcMain.on('processFile', (event, filePath) => {
        return withErrorReporting(() => {
            return processFile({mainWindow, configStore, filePath});
        });
    });

    // open and process a file using an open file dialog
    ipcMain.on('preProcessFileOpenDialog', (event, _) => {
        return withErrorReporting(() => {
            return preProcessFileOpenDialog({mainWindow, configStore})
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

        registerIpcHandlers({mainWindow, configStore})
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


