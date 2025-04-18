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

import path from 'node:path';
import { BrowserWindow, dialog } from 'electron';
import { baseFileName } from '../util';
import {
  processFile as backendProcessFile,
  SUPPORTED_FILE_TYPES,
} from 'common-identifier-algorithm-shared';
import type { Config, ConfigStore } from 'common-identifier-algorithm-shared';

import Debug from 'debug';
const log = Debug('CID:main:ipc::processFile');

import { makeHasher } from '../active_algorithm';
import { EVENT } from '../../../common/events';

const MAX_ROWS_TO_PREVIEW = 500;

// The actual processing function called after the output path is selected
async function doProcessFile(
  mainWindow: BrowserWindow,
  configStore: ConfigStore,
  inputFilePath: string,
  outputPath: string,
) {
  const config = configStore.getConfig() as Config.Options;
  let outputFormat = undefined;
  let outputBasePath = outputPath;
  // figure out the output path
  const extension = path.extname(outputPath);
  // we may need to use the extension-less output path (if we replace the extension)
  const basePath = path.join(
    path.dirname(outputPath),
    path.basename(outputPath, path.extname(outputPath)),
  );

  switch (extension.toLowerCase()) {
    case '.xlsx':
      outputFormat = SUPPORTED_FILE_TYPES.XLSX;
      outputBasePath = basePath;
      break;
    case '.csv':
      outputFormat = SUPPORTED_FILE_TYPES.CSV;
      outputBasePath = basePath;
      break;
    default:
      outputFormat = undefined;
      outputBasePath = basePath;
      break;
  }

  const { isMappingDocument, document, outputFilePath, mappingFilePath } =
    await backendProcessFile({
      config,
      outputPath: outputBasePath,
      inputFilePath,
      hasherFactory: makeHasher,
      format: outputFormat,
    });

  log('PROCESSING DONE');

  if (document.data.length > MAX_ROWS_TO_PREVIEW) {
    log(`dataset has ${document.data.length} rows, trimming for frontend preview`);
    document.data = document.data.slice(0, MAX_ROWS_TO_PREVIEW);
  }
  mainWindow.webContents.send(EVENT.PROCESSING_DONE, {
    isMappingDocument,
    document,
    outputFilePath,
    mappingFilePath,
  });
}

// Process a file
export async function processFile(mainWindow: BrowserWindow, configStore: ConfigStore, filePath: string) {
  log('Processing File:', filePath);

  const response = await dialog.showSaveDialog({
    defaultPath: baseFileName(filePath),
  });
  if (response.canceled || response.filePath === '') {
    log('no file selected');
    // send the canceled message
    mainWindow.webContents.send(EVENT.PROCESSING_CANCELLED, {});
    return;
  }
  const outputPath = response.filePath;
  log('STARTING TO PROCESS AS', outputPath);
  return doProcessFile(mainWindow, configStore, filePath, outputPath);
}
