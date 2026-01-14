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

import { BrowserWindow, dialog } from 'electron';
import log from "electron-log/main";

import type { Config, ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import { EVENT } from '../../../../common/events';
import { WorkerManager } from '../workers';
import type { ValidatePayload, ValidateResult } from '../workers/validateFileWorker';

const ipcLog = log.scope("ipc:validate"); 

type WM = WorkerManager<ValidatePayload, ValidateResult>

export async function validateFile(mainWindow: BrowserWindow, manager: WM, configStore: ConfigStore, filePath?: string) {
  // Handle file dialogue if no file path provided
  if (!filePath) {
    ipcLog.info('No file path provided, showing dialogue window for selection.');
    filePath = await handleFileDialogue(mainWindow, configStore);
    if (!filePath) return;
  }
  else ipcLog.info(`File dropped: ${filePath}`);

  const config = configStore.getConfig() as Config.FileConfiguration;

  // Spawn validation worker process
  manager.spawn({ config, filePath }, (message) => {
    if (message.status === "cancelled") {
      ipcLog.info('File validation worker reported cancellation.');
      return; // NO-OP: renderer process already informed of cancellation
    }

    if (message.status === "success") {
      if (!message.payload.isValid) ipcLog.info(`File validation completed with ${message.payload.document.data.length} errors`);
      else ipcLog.info('File validation completed successfully with no errors.');

      mainWindow.webContents.send(EVENT.VALIDATION_FINISHED, message.payload);
    }
    else {
      ipcLog.error(`File validation worker error: ${message.error}`);
      mainWindow.webContents.send(EVENT.ERROR, message.error);
    }
  });
}

async function handleFileDialogue(mainWindow: BrowserWindow, configStore: ConfigStore) {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV or XLSX files', extensions: ['csv', 'xlsx'] }],
  });

  if (!response.canceled) return response.filePaths[0];

  ipcLog.info('No file selected from dialogue, sending cancellation event.');
  mainWindow.webContents.send(EVENT.WORKFLOW_CANCELLED, {});
  return;
}