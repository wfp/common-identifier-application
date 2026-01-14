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

import path from 'node:path';
import { BrowserWindow, dialog } from 'electron';
import log from "electron-log/main";

import { SUPPORTED_FILE_TYPES} from '@wfp/common-identifier-algorithm-shared';
import type { Config, ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import { EVENT } from '../../../../common/events';
import { WorkerManager } from '../workers';
import type { ProcessPayload, ProcessResult } from '../workers/processFileWorker';

const ipcLog = log.scope("ipc:process");

type WM = WorkerManager<ProcessPayload, ProcessResult>

export async function processFile(mainWindow: BrowserWindow, manager: WM, configStore: ConfigStore, filePath: string) {
  ipcLog.info('Processing File:', filePath);

  const response = await dialog.showSaveDialog({
    defaultPath: path.parse(filePath).name,
  });

  if (response.canceled || response.filePath === '') {
    ipcLog.info('No file selected, cancelling workflow');
    mainWindow.webContents.send(EVENT.WORKFLOW_CANCELLED);
    return;
  }

  const config = configStore.getConfig() as Config.FileConfiguration;
  const { outputPath, outputFormat } = getOutputFileDetails(response.filePath!);

  manager.spawn({ config, inputPath: filePath, outputPath, outputFormat }, (message) => {
    if (message.status === "cancelled") {
      ipcLog.info('File processing worker reported cancellation.');
      return; // NO-OP: renderer process already informed of cancellation
    }

    if (message.status === "success") {
      ipcLog.info('File processing completed successfully.');
      mainWindow.webContents.send(EVENT.PROCESSING_FINISHED, message.payload);
    }
    else {
      ipcLog.error(`File processing worker error: ${message.error}`);
      mainWindow.webContents.send(EVENT.ERROR, message.error);
    }
  });
}

function getOutputFileDetails(filePath: string) {
  let outputFormat = undefined;
  // figure out the output path
  const extension = path.extname(filePath);
  // we may need to use the extension-less output path (if we replace the extension)
  const basePath = path.join(
    path.dirname(filePath),
    path.basename(filePath, path.extname(filePath)),
  );

  switch (extension.toLowerCase()) {
    case '.xlsx':
      outputFormat = SUPPORTED_FILE_TYPES.XLSX;
      break;
    case '.csv':
      outputFormat = SUPPORTED_FILE_TYPES.CSV;
      break;
    default:
      outputFormat = undefined;
      break;
  }

  return { outputPath: basePath, outputFormat };
}