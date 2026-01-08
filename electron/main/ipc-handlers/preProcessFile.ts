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

import { BrowserWindow } from 'electron';
import { preprocessFile as backendPreProcessFile } from '@wfp/common-identifier-algorithm-shared';
import type { Config, ConfigStore } from '@wfp/common-identifier-algorithm-shared';
import { EVENT } from '../../../common/events';

import Debug from 'debug';
const log = Debug('cid::electron::ipc::preprocess');

const MAX_ROWS_TO_PREVIEW = 500;

export async function preProcessFile(mainWindow: BrowserWindow, configStore: ConfigStore, filePath: string) {
  log(`[INFO] Dropped File: ${filePath}`);

  const config = configStore.getConfig() as Config.FileConfiguration;

  const { isValid, isMappingDocument, document, errorFilePath, inputFilePath } =
    await backendPreProcessFile({ config, inputFilePath: filePath });
  log('[INFO] PREPROCESSING DONE');

  // if this is error data, filter to only errors first.
  if (!isValid) {
    const errors = document.data.filter((r) => r.errors);
    log(`[INFO] ${errors.length} validation errors found`);
    document.data = errors;
  }

  // don't return large datasets back to the frontend, instead splice and send n rows
  if (document.data.length > MAX_ROWS_TO_PREVIEW) {
    log(`[WARN] input data array has ${document.data.length} rows, trimming for frontend preview`);
    document.data = document.data.slice(0, MAX_ROWS_TO_PREVIEW);
  }

  mainWindow.webContents.send(EVENT.PREPROCESSING_FINISHED, {
    isValid,
    isMappingDocument,
    document,
    errorFilePath,
    inputFilePath,
  });
}
