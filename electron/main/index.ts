// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.

// Modules to control application life and create native browser window
import { app, BrowserWindow, ipcMain, screen } from 'electron';
import { shell } from 'electron';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import {
  makeConfigStore,
  appDataLocation,
} from 'common-identifier-algorithm-shared';
import type { ConfigStore } from 'common-identifier-algorithm-shared';


// IPC event handlers
import { requestConfigUpdate } from './ipc-handlers/requestConfigUpdate';
import { loadNewConfig } from './ipc-handlers/loadNewConfig';
import { preProcessFile } from './ipc-handlers/preProcessFile';
import { processFile } from './ipc-handlers/processFile';
import { preProcessFileOpenDialog } from './ipc-handlers/preProcessFileOpenDialog';
import { removeUserConfig } from './ipc-handlers/removeUserConfig';

import { REGION } from './active_algorithm';
import { EVENT } from '../../common/events';

import Debug from 'debug';
const log = Debug('CID:main');

const __dirname = dirname(fileURLToPath(import.meta.url));

const RENDERER_DIST = join(__dirname, '../dist');
const PRELOAD_PATH = join(__dirname, 'preload.mjs');
const INDEX_HTML = join(RENDERER_DIST, 'index.html');

// CONSTANTS FOR FILE PATHS, INSTALLATION DIRECTORIES ETC.
const APP_DIR_NAME = `commonid-tool-${REGION.toLowerCase()}`;
const CONFIG_FILE_NAME = `config.${REGION}.json`;
const APP_CONFIG_FILE_NAME = `appconfig.${REGION}.json`;
const BACKUP_CONFIG_FILE_PATH = join(RENDERER_DIST, 'config.backup.toml');

const APP_DIR_PATH = join(appDataLocation(), APP_DIR_NAME); // the path of the application's data files
const CONFIG_FILE_PATH = join(APP_DIR_PATH, CONFIG_FILE_NAME); // the path of the store configuration file
const APP_CONFIG_FILE_PATH = join(APP_DIR_PATH, APP_CONFIG_FILE_NAME); // the path of the application config file (containing config-independent settings)

function createMainWindow(configStore: ConfigStore) {
  // figure out the existing window configuration
  const defaultWindow = configStore.appConfig.window;

  const targetDisplay = screen.getDisplayMatching({
    x: defaultWindow.x, y: defaultWindow.y,
    width: defaultWindow.width, height: defaultWindow.height
  }).bounds

  // if window width/height are larger than the display width/height, clamp
  if (defaultWindow.height > targetDisplay.height || defaultWindow.width > targetDisplay.width) {
    defaultWindow.x      = targetDisplay.x;
    defaultWindow.y      = targetDisplay.y;
    defaultWindow.width  = targetDisplay.width;
    defaultWindow.height = targetDisplay.height;
  }

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    ...defaultWindow, // { x, y, width, height, fullscreen }

    minWidth: 880,
    minHeight: 640,

    webPreferences: {
      preload: PRELOAD_PATH,
      contextIsolation: true,
      nodeIntegration: true,
    },
    autoHideMenuBar: true,
  });

  return mainWindow;
}

function createWindow(configStore: ConfigStore) {
  const mainWindow = createMainWindow(configStore);

  registerIPCHandlers(mainWindow, configStore);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(INDEX_HTML);
  }

  // set the icon on windows (setting the icon to a .ico file on Mac results in a throw)
  if (process.platform === 'win32') {
    mainWindow.setIcon(`${resolve(__dirname, '../public/logo.ico')}`);
  } else if (process.platform === 'darwin') {
    // MacOS requires a PNG (it does not seem to like ICNS here, but only accepts ICNS
    // for the packaging) + changing this line does not seem to change the
    mainWindow.setIcon(`${resolve(__dirname, '../public/logo.png')}`);
  }

  mainWindow.on('close', () => {
    const windowBounds = { ...mainWindow.getBounds(), fullscreen: mainWindow.isFullScreen() }
    configStore.updateDisplayConfig(windowBounds);
  });

  return mainWindow;
}

function registerIPCHandlers(mainWindow: BrowserWindow, configStore: ConfigStore) {
  log("registerIpcHandlers");
  const withErrorReporting = async (delegate: CallableFunction) => {
    // catch errors that bubble up es exceptions and convert them to rejections
    return new Promise(function (resolve, reject) {
      try { resolve(delegate()); } catch (e) { reject(e); }
    }).catch((e) => {
      // catch errors that bubble up as rejections
      log(`INTERNAL ERROR: ${e}`);
      mainWindow.webContents.send(EVENT.ERROR, e.toString());
    });
  }
  // Handle dropping of files
  ipcMain.on(EVENT.FILE_DROPPED, (_, filePath: string) => {
    log(`Received event on channel: ${EVENT.FILE_DROPPED}`);
    // return withErrorReporting(() => preProcessFile({ mainWindow, configStore, filePath }));
    return withErrorReporting(() => preProcessFile(mainWindow, configStore, filePath));
  });
  // Start processing the file
  ipcMain.on(EVENT.PROCESS_FILE, (_, filePath: string) => {
    log(`Received event on channel: ${EVENT.PROCESS_FILE}`);
    // return withErrorReporting(() => processFile({ mainWindow, configStore, filePath }));
    return withErrorReporting(() => processFile(mainWindow, configStore, filePath));
  });
  // open and process a file using an open file dialog
  ipcMain.on(EVENT.PREPROCESS_FILE_OPEN_DIALOG, (_) => {
    log(`Received event on channel: ${EVENT.PREPROCESS_FILE_OPEN_DIALOG}`);
    // return withErrorReporting(() => preProcessFileOpenDialog({ mainWindow, configStore }));
    return withErrorReporting(() => preProcessFileOpenDialog(mainWindow, configStore));
  });
  // config related events need to be initialised before the renderer since
  // the app makes a requestConfigUpdate call on boot.
  ipcMain.handle(EVENT.REQUEST_CONFIG_UPDATE, () => {
    log(`Received event on channel: ${EVENT.REQUEST_CONFIG_UPDATE}`);
    return withErrorReporting(() => requestConfigUpdate(configStore));
  });
  ipcMain.handle(EVENT.LOAD_NEW_CONFIG, () => {
    log(`Received event on channel: ${EVENT.LOAD_NEW_CONFIG}`);
    return withErrorReporting(() => loadNewConfig(configStore));
  });
  ipcMain.handle(EVENT.REMOVE_USER_CONFIG, () => {
    log(`Received event on channel: ${EVENT.REMOVE_USER_CONFIG}`);
    return withErrorReporting(() => removeUserConfig(configStore));
  });
  // mark the terms and conditions accepted
  ipcMain.on(EVENT.ACCEPT_TERMS_AND_CONDITIONS, (_) => {
    log(`Received event on channel: ${EVENT.ACCEPT_TERMS_AND_CONDITIONS}`);
    configStore.acceptTermsAndConditions();
  });
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
  log("createAndRegisterWindow");
  const configStore = makeConfigStore({
    filePaths: {
      config: CONFIG_FILE_PATH,
      appConfig: APP_CONFIG_FILE_PATH,
      backupConfig: BACKUP_CONFIG_FILE_PATH
    },
    region: REGION,
    usingUI: true
  });
  configStore.boot();
  
  createWindow(configStore);
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  unregisterIpcHandlers();
  if (process.platform !== 'darwin') app.quit();
});
