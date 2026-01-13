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

import { preprocessFile } from '@wfp/common-identifier-algorithm-shared';
import type { Config, ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import { EVENT } from '../../../common/events';

const ipcLog = log.scope("ipc:validate"); 

const MAX_ROWS_TO_PREVIEW = 500;

// TODO: Look at porting this operation to a utility worker

async function handleFileDialogue(mainWindow: BrowserWindow, configStore: ConfigStore) {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV or XLSX files', extensions: ['csv', 'xlsx'] }],
  });

  if (!response.canceled) return response.filePaths[0];

  ipcLog.warn('No file selected from dialogue, sending cancellation event.');
  mainWindow.webContents.send(EVENT.WORKFLOW_CANCELLED, {});
  return;
}

export async function validateFile(mainWindow: BrowserWindow, configStore: ConfigStore, filePath?: string) {
  if (!filePath) {
    ipcLog.info('No file path provided, showing dialogue window for selection.');
    filePath = await handleFileDialogue(mainWindow, configStore);
    if (!filePath) return;
  }
  else ipcLog.info(`File dropped: ${filePath}`);

  const config = configStore.getConfig() as Config.FileConfiguration;

  const { isValid, isMappingDocument, document, errorFilePath, inputFilePath } =
    await preprocessFile({ config, inputFilePath: filePath });

  // if this is error data, filter to only errors first.
  if (!isValid) {
    const errors = document.data.filter((r) => r.errors);
    ipcLog.info(`File validation complete, ${errors.length} validation errors found`);
    document.data = errors;
  } else ipcLog.info('File validation complete, no validation errors found');

  // don't return large datasets back to the frontend, instead splice and send n rows
  if (document.data.length > MAX_ROWS_TO_PREVIEW) {
    ipcLog.warn(`Input data array has ${document.data.length} rows, trimming to ${MAX_ROWS_TO_PREVIEW} for frontend preview`);
    document.data = document.data.slice(0, MAX_ROWS_TO_PREVIEW);
  }

  mainWindow.webContents.send(EVENT.VALIDATION_FINISHED, {
    isValid,
    isMappingDocument,
    document,
    errorFilePath,
    inputFilePath,
  });
}
