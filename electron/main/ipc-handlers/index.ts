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
import { shell, ipcMain } from "electron";
import type { BrowserWindow } from "electron";
import log from "electron-log/main";
import path from "node:path";

import type { ConfigStore } from "@wfp/common-identifier-algorithm-shared";
import { ALL_EVENTS, EVENT } from "../../../common/events";

import { loadSystemConfig } from './handlers/loadSystemConfig';
import { loadNewConfig } from './handlers/loadNewConfig';
import { validateFile } from './handlers/validateFile';
import { processFile } from './handlers/processFile';
import { removeConfig } from './handlers/removeConfig';
import { encryptFile } from "./handlers/encryptFile";
import { WorkerManager } from "./workers";
import type { ValidatePayload, ValidateResult } from "./workers/validateFileWorker";
import type { ProcessPayload, ProcessResult } from "./workers/processFileWorker";
import type { EncryptPayload, EncryptResult } from "./workers/encryptFileWorker";

const ipcLog = log.scope("ipc");

const managers = {
  validate: new WorkerManager<ValidatePayload, ValidateResult>("validateFileWorker"),
  process: new WorkerManager<ProcessPayload, ProcessResult>("processFileWorker"),
  encrypt: new WorkerManager<EncryptPayload, EncryptResult>("encryptFileWorker"),
}

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
  ipcMain.on(EVENT.VALIDATION_START_DROP, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.VALIDATION_START_DROP}`);
    return withErrorReporting(() => validateFile(mainWindow, managers.validate, configStore, filePath));
  });

  // open and process a file using an open file dialog
  ipcMain.on(EVENT.VALIDATION_START_DIALOGUE, (_) => {
    ipcLog.debug(`Received event on channel: ${EVENT.VALIDATION_START_DIALOGUE}`);
    return withErrorReporting(() => validateFile(mainWindow, managers.validate, configStore));
  });

  // Start processing the file
  ipcMain.on(EVENT.PROCESSING_START, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.PROCESSING_START}`);
    return withErrorReporting(() => processFile(mainWindow, managers.process, configStore, filePath));
  });

  // Start file encryption
  ipcMain.on(EVENT.ENCRYPTION_START, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.ENCRYPTION_START}`);
    return withErrorReporting(() => encryptFile(mainWindow, managers.encrypt, configStore, filePath));
  });

  // config related events need to be initialised before the renderer since
  // the app makes a loadSystemConfig call on boot.
  ipcMain.handle(EVENT.CONFIG_LOAD_SYSTEM, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_LOAD_SYSTEM}`);
    return withErrorReporting(() => loadSystemConfig(configStore));
  });

  ipcMain.handle(EVENT.CONFIG_LOAD_NEW, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_LOAD_NEW}`);
    return withErrorReporting(() => loadNewConfig(configStore));
  });

  ipcMain.handle(EVENT.CONFIG_REMOVE, () => {
    ipcLog.debug(`Received event on channel: ${EVENT.CONFIG_REMOVE}`);
    return withErrorReporting(() => removeConfig(configStore));
  });

  // mark the terms and conditions accepted
  ipcMain.on(EVENT.ACCEPT_TERMS_AND_CONDITIONS, (_) => {
    ipcLog.debug(`Received event on channel: ${EVENT.ACCEPT_TERMS_AND_CONDITIONS}`);
    configStore.acceptTermsAndConditions();
  });

  // open a file with the OS default app
  ipcMain.on(EVENT.OPEN_OUTPUT_FILE, async (_, filePath: any) => {
    ipcLog.debug(`Received event on channel: ${EVENT.OPEN_OUTPUT_FILE}`);
    const error = await shell.openPath(filePath);
    if (error) ipcLog.error(`Failed to open file ${filePath}: ${error}`);
  });

  // open the file explorer/finder at the given directory path
  ipcMain.on(EVENT.REVEAL_IN_DIRECTORY, (_, filePath: string) => {
    ipcLog.debug(`Received event on channel: ${EVENT.REVEAL_IN_DIRECTORY}`);
    shell.showItemInFolder(path.normalize(filePath));
  });

  // terminate any running workers - this function is called when routing back to MAIN from any workflow
  ipcMain.on(EVENT.RESET, (_) => {
    ipcLog.debug(`Received event on channel: ${EVENT.RESET}`);
    Object.values(managers).forEach((man) => man.cancelAll());
  });

  // quit when receiving the 'quit' signal
  ipcMain.once(EVENT.QUIT, (_) => {
    ipcLog.info(`Received '${EVENT.QUIT}' event, deregistering IPC handlers and quitting app`);
    deregisterIpcHandlers();
    app.quit()
  });
}

export function deregisterIpcHandlers() {
  Object.entries(ALL_EVENTS).forEach(([event, type]) => {
    ipcLog.debug(`Deregistering event: ${event} of type: ${type}`);
    if (type === 'event') ipcMain.removeAllListeners(event);
    if (type === 'handle') ipcMain.removeHandler(event);
  });
}