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
import { shell, ipcMain, type BrowserWindow } from "electron";
import log from "electron-log/main";
import type { ConfigStore } from "@wfp/common-identifier-algorithm-shared";

import { EVENT } from "../../../common/events";

import { requestConfigUpdate } from './requestConfigUpdate';
import { loadNewConfig } from './loadNewConfig';
import { preProcessFile } from './preProcessFile';
import { processFile } from './processFile';
import { preProcessFileOpenDialog } from './preProcessFileOpenDialog';
import { removeUserConfig } from './removeUserConfig';

const ipcLog = log.scope("ipc");

export function registerIpcHandlers(app: Electron.App, mainWindow: BrowserWindow, configStore: ConfigStore) {
  ipcLog.info("Registering IPC Handlers");
  const withErrorReporting = async (delegate: CallableFunction) => {
    // catch errors that bubble up es exceptions and convert them to rejections
    return new Promise(function (resolve, reject) {
      try { resolve(delegate()); } catch (e) { reject(e); }
    }).catch((e) => {
      // catch errors that bubble up as rejections
      ipcLog.error(`INTERNAL ERROR: ${e}`);
      mainWindow.webContents.send(EVENT.ERROR, e.toString());
    });
  }

  // Handle dropping of files / begin preprocessing
  ipcMain.on(EVENT.PREPROCESSING_START_DROP, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.PREPROCESSING_START_DROP}`);
    return withErrorReporting(() => preProcessFile(mainWindow, configStore, filePath));
  });

  // open and process a file using an open file dialog
  ipcMain.on(EVENT.PREPROCESSING_START_DIALOGUE, (_) => {
    ipcLog.debug(`Received event on channel: ${EVENT.PREPROCESSING_START_DIALOGUE}`);
    return withErrorReporting(() => preProcessFileOpenDialog(mainWindow, configStore));
  });

  // Start processing the file
  ipcMain.on(EVENT.PROCESSING_START, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.PROCESSING_START}`);
    return withErrorReporting(() => processFile(mainWindow, configStore, filePath));
  });

  // config related events need to be initialised before the renderer since
  // the app makes a requestConfigUpdate call on boot.
  ipcMain.handle(EVENT.CONFIG_REQUEST_UPDATE, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_REQUEST_UPDATE}`);
    return withErrorReporting(() => requestConfigUpdate(configStore));
  });

  ipcMain.handle(EVENT.CONFIG_LOAD_NEW, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_LOAD_NEW}`);
    return withErrorReporting(() => loadNewConfig(configStore));
  });

  ipcMain.handle(EVENT.CONFIG_REMOVE, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_REMOVE}`);
    return withErrorReporting(() => removeUserConfig(configStore));
  });

  // mark the terms and conditions accepted
  ipcMain.on(EVENT.ACCEPT_TERMS_AND_CONDITIONS, (_) => {
    ipcLog.debug(`Received event on channel: ${EVENT.ACCEPT_TERMS_AND_CONDITIONS}`);
    configStore.acceptTermsAndConditions();
  });

  // open a file with the OS default app
  ipcMain.on(EVENT.OPEN_OUTPUT_FILE, (_, filePath: any) => {
    ipcLog.debug(`Received event on channel: ${EVENT.OPEN_OUTPUT_FILE}`);
    shell.openPath(filePath);
  });

  // quit when receiving the 'quit' signal
  ipcMain.once(EVENT.QUIT, (_) => {
    ipcLog.info(`Received '${EVENT.QUIT}' event, deregistering IPC handlers and quitting app`);
    deregisterIpcHandlers();
    app.quit()
  });
}

export function deregisterIpcHandlers() {
  ipcLog.info("Deregistering IPC Handlers");
  // Event handlers
  // --------------
  [
    EVENT.PREPROCESSING_START_DROP,
    EVENT.PROCESSING_START,
    EVENT.PREPROCESSING_START_DIALOGUE,
    EVENT.OPEN_OUTPUT_FILE,
    EVENT.QUIT,
    EVENT.ACCEPT_TERMS_AND_CONDITIONS,
  ].forEach((channel) => {
    ipcLog.info(`Deregistering ${channel}`)
    ipcMain.removeAllListeners(channel)
  });

  // IPC functions
  // -------------
  [
    EVENT.CONFIG_REQUEST_UPDATE,
    EVENT.CONFIG_LOAD_NEW,
    EVENT.CONFIG_REMOVE,
  ].forEach(
    (channel) => {
      ipcLog.debug(`Deregistering ${channel}`)
      ipcMain.removeHandler(channel)
    },
  );
}