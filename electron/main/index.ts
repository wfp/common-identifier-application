/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */
import { app, BrowserWindow, screen } from 'electron';
import { dirname, join, resolve } from 'node:path';
import { existsSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

import type { ConfigStore } from '@wfp/common-identifier-algorithm-shared';

import { deregisterIpcHandlers, registerIpcHandlers } from './ipc-handlers';
import { ALGORITHM_ID } from '@selected-algo';
import { registerLogHandlers } from './util';

import Debug from 'debug';
const log = Debug('cid::electron::main');

// init logs and redirect debug output to file to capture engine logs
registerLogHandlers();

const __dirname = dirname(fileURLToPath(import.meta.url));

const RENDERER_DIST = join(__dirname, '../dist');
const ASSETS_DIR = join(__dirname, 'assets/');
const PRELOAD_PATH = join(__dirname, 'preload.mjs');
const INDEX_HTML = join(RENDERER_DIST, 'index.html');

// CONSTANTS FOR FILE PATHS, INSTALLATION DIRECTORIES ETC.
const APPLICATION_DATA_DIR = app.getPath("userData");
const CONFIG_FILE_DIR = join(APPLICATION_DATA_DIR, "config");
if (!existsSync(CONFIG_FILE_DIR)) mkdirSync(CONFIG_FILE_DIR);

const SALT_FILE_PATH = join(ASSETS_DIR, "salt.asc");                    // the path to the bundled salt file in the assets dir
const CONFIG_FILE_PATH = join(CONFIG_FILE_DIR, "config.json");          // the path of the store configuration file
const APP_CONFIG_FILE_PATH = join(CONFIG_FILE_DIR, "appconfig.json");   // the path of the application config file (containing config-independent settings)
const BACKUP_CONFIG_FILE_PATH = join(ASSETS_DIR, 'config.backup.toml'); // the path to the fallback configuration file in the assets dir

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

  const mainWindow = new BrowserWindow({
    ...defaultWindow, // { x, y, width, height, fullscreen }

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

  registerIpcHandlers(app, mainWindow, configStore);

  if (process.env.VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(process.env.VITE_DEV_SERVER_URL);
    mainWindow.webContents.openDevTools();
  } else {
    mainWindow.loadFile(INDEX_HTML);
  }

  if (process.platform === 'win32') {
    mainWindow.setIcon(`${resolve(__dirname, '../public/logo.ico')}`);
  } else if (process.platform === 'darwin') {
    mainWindow.setIcon(`${resolve(__dirname, '../public/logo.png')}`);
  }

  // TODO: something here isn't working with second monitors.
  //       If the app was running on 2nd monitor that was then disconnected, there are some instances
  //       where it still launches off-screen.
  mainWindow.on('close', () => {
    const windowBounds = { ...mainWindow.getBounds(), fullscreen: mainWindow.isFullScreen() }
    configStore.updateDisplayConfig(windowBounds);
  });

  return mainWindow;
}

app.whenReady().then(async () => {
  const { makeConfigStore } = await import('@wfp/common-identifier-algorithm-shared');
  
  log("[INFO] createAndRegisterWindow");
  const configStore = makeConfigStore({
    filePaths: {
      config: CONFIG_FILE_PATH,
      appConfig: APP_CONFIG_FILE_PATH,
      backupConfig: BACKUP_CONFIG_FILE_PATH,
    },
    algorithmId: ALGORITHM_ID,
    usingUI: true,
    saltConfiguration: { source: "FILE", value: SALT_FILE_PATH }
  });
  configStore.boot();

  createWindow(configStore);
});

app.on('window-all-closed', () => {
  deregisterIpcHandlers();
  if (process.platform !== 'darwin') app.quit();
});
