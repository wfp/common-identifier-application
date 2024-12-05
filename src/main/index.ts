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
import { app, BrowserWindow, ipcMain } from 'electron/main';
import { shell } from 'electron';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { resolveHtmlPath } from './util.js';
import {
  ConfigStore,
  makeConfigStore,
  appDataLocation,
} from 'common-identifier-algorithm-shared';

// IPC event handlers
import { requestConfigUpdate } from './ipc-handlers/requestConfigUpdate.js';
import { loadNewConfig } from './ipc-handlers/loadNewConfig.js';
import { preProcessFile } from './ipc-handlers/preProcessFile.js';
import { processFile } from './ipc-handlers/processFile.js';
import { preProcessFileOpenDialog } from './ipc-handlers/preProcessFileOpenDialog.js';
import { removeUserConfig } from './ipc-handlers/removeUserConfig.js';

import { REGION } from './active_algorithm.js';
import { EVENT } from './types.js';

import {
  handleSquirrelEvent,
  createDesktopShortcut,
} from './squirell-callbacks.js';

import Debug from 'debug';
const log = Debug('CID:main');

const __dirname = dirname(fileURLToPath(import.meta.url));

// CONSTANTS FOR FILE PATHS, INSTALLATION DIRECTORIES ETC.
const APP_DIR_NAME = `commonid-tool-${REGION.toLowerCase()}`;
const CONFIG_FILE_NAME = `config.${REGION}.json`;
const APP_CONFIG_FILE_NAME = `appconfig.${REGION}.json`;
const BACKUP_CONFIG_FILE_PATH = join(__dirname, 'config.backup.toml');
// the path of the application's data files
const APP_DIR_PATH = join(appDataLocation(), APP_DIR_NAME);
// the path of the store configuration file
const CONFIG_FILE_PATH = join(APP_DIR_PATH, CONFIG_FILE_NAME);
// the path of the application config file (containing config-independent settings)
const APP_CONFIG_FILE_PATH = join(APP_DIR_PATH, APP_CONFIG_FILE_NAME);

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
    autoHideMenuBar: true,
  });

  return mainWindow;
}

function createWindow() {
  const configStore = makeConfigStore({
    configFilePath: CONFIG_FILE_PATH,
    appConfigFilePath: APP_CONFIG_FILE_PATH,
    backupConfigFilePath: BACKUP_CONFIG_FILE_PATH,
    region: REGION
  });
  // start loading the config here
  configStore.boot();

  const mainWindow = createMainWindow(configStore);

  // and load the index.html of the app.
  mainWindow.loadURL(resolveHtmlPath('renderer.html'));

  // set the icon on windows (setting the icon to a .ico file on Mac results in a throw)
  if (process.platform === 'win32') {
    mainWindow.setIcon(`${resolve(__dirname, '../../assets/logo.ico')}`);
  } else if (process.platform === 'darwin') {
    // MacOS requires a PNG (it does not seem to like ICNS here, but only accepts ICNS
    // for the packaging) + changing this line does not seem to change the
    mainWindow.setIcon(`${resolve(__dirname, '../../assets/logo.png')}`);
  }

  // Open the DevTools.
  mainWindow.webContents.openDevTools()

  return { mainWindow, configStore };
}

interface IPCRegisterHandlersInput {
  mainWindow: BrowserWindow;
  configStore: ConfigStore;
}

// Registers all handlers for the window
async function registerIpcHandlers({ mainWindow, configStore }: IPCRegisterHandlersInput) {
  log("registerIpcHandlers");
  function withErrorReporting(delegate: CallableFunction) {
    // catch errors that bubble up es exceptions and convert them to rejections
    return new Promise(function (resolve, reject) {
      try { resolve(delegate()); } catch (e) { reject(e); }
    }).catch((e) => {
      // catch errors that bubble up as rejections
      log('INTERNAL ERROR: ', e);
      mainWindow.webContents.send('error', e.toString());
    });
  }

  // Event handlers
  // --------------

  // PROCESSING-RELATED
  // ------------------

  // Handle dropping of files
  ipcMain.on(EVENT.FILE_DROPPED, (_, filePath: string) => {
    log(`Received event on channel: ${EVENT.FILE_DROPPED}`);
    return withErrorReporting(() => preProcessFile({ mainWindow, configStore, filePath }))
  });

  // Start processing the file
  ipcMain.on(EVENT.PROCESS_FILE, (_, filePath: string) => {
    log(`Received event on channel: ${EVENT.PROCESS_FILE}`);
    return withErrorReporting(() => {
      return processFile({ mainWindow, configStore, filePath });
    });
  });

  // open and process a file using an open file dialog
  ipcMain.on(EVENT.PREPROCESS_FILE_OPEN_DIALOG, (_) => {
    log(`Received event on channel: ${EVENT.PREPROCESS_FILE_OPEN_DIALOG}`);
    return withErrorReporting(() => {
      return preProcessFileOpenDialog({ mainWindow, configStore });
    });
  });

  // MISC
  // ----
  // open a file with the OS default app
  ipcMain.on(EVENT.OPEN_OUTPUT_FILE, (_, filePath: any) => {
    log(`Received event on channel: ${EVENT.OPEN_OUTPUT_FILE}`);
    shell.openPath(filePath);
  });

  // quit when receiving the 'quit' signal
  ipcMain.on(EVENT.QUIT, (_) => {
    log(`Received event on channel: ${EVENT.QUIT}`);
    app.quit()
  });

  // mark the terms and conditions accepted
  ipcMain.on(EVENT.ACCEPT_TERMS_AND_CONDITIONS, (_) => {
    log(`Received event on channel: ${EVENT.ACCEPT_TERMS_AND_CONDITIONS}`);
    configStore.acceptTermsAndConditions();
  });

  // CONFIG-RELATED
  // --------------

  ipcMain.handle(EVENT.REQUEST_CONFIG_UPDATE, () => {
    log(`Received event on channel: ${EVENT.REQUEST_CONFIG_UPDATE}`);
    return requestConfigUpdate({ configStore });
  });

  ipcMain.handle(EVENT.LOAD_NEW_CONFIG, () => {
    log(`Received event on channel: ${EVENT.LOAD_NEW_CONFIG}`);
    return loadNewConfig({ configStore });
  });

  ipcMain.handle(EVENT.REMOVE_USER_CONFIG, () => {
    log(`Received event on channel: ${EVENT.REMOVE_USER_CONFIG}`);
    return removeUserConfig({ configStore });
  });
}

// Unregisters all Elecron IPCMain IPC / event handlers to eansure that closed
// windows have no stuck event handlers.
function unregisterIpcHandlers() {
  // Event handlers
  // --------------
  [
    EVENT.FILE_DROPPED,
    EVENT.PROCESS_FILE,
    EVENT.PREPROCESS_FILE_OPEN_DIALOG,
    EVENT.OPEN_OUTPUT_FILE,
    EVENT.QUIT,
    EVENT.ACCEPT_TERMS_AND_CONDITIONS,
  ].forEach((channel) => {
    log(`Deregistering ${channel}`)
    ipcMain.removeAllListeners(channel)
  });

  // IPC functions
  // -------------
  [
    EVENT.REQUEST_CONFIG_UPDATE,
    EVENT.LOAD_NEW_CONFIG,
    EVENT.REMOVE_USER_CONFIG,
  ].forEach(
    (channel) => {
      log(`Deregistering ${channel}`)
      ipcMain.removeHandler(channel)
    },
  );
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  function createAndRegisterWindow() {
    log("createAndRegisterWindow")
    const { mainWindow, configStore } = createWindow();

    registerIpcHandlers({ mainWindow, configStore });
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
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});
