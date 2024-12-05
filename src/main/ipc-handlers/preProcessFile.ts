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

import { BrowserWindow } from 'electron';
import {
  ConfigStore,
  preprocessFile as backendPreProcessFile,
} from 'common-identifier-algorithm-shared';
import { EVENT } from '../types.js';

import Debug from 'debug';
const log = Debug('CID:main:ipc::preProcessFile');

const MAX_ROWS_TO_PREVIEW = 500;

interface IPCFileDroppedInput {
  mainWindow: BrowserWindow;
  configStore: ConfigStore;
  filePath: string;
}

export async function preProcessFile({
  mainWindow,
  configStore,
  filePath,
}: IPCFileDroppedInput) {
  log('Dropped File:', filePath);

  const config = configStore.getConfig();

  const { isValid, isMappingDocument, document, errorFilePath, inputFilePath } =
    await backendPreProcessFile({ config, inputFilePath: filePath });
  log('PREPROCESSING DONE');

  // if this is error data, filter to only errors first.
  if (!isValid) {
    const errors = document.data.filter((r) => r.errors);
    log(`${errors.length} validation errors found`);
    document.data = errors;
  }

  // don't return large datasets back to the frontend, instead splice and send n rows
  if (document.data.length > MAX_ROWS_TO_PREVIEW) {
    log(`input data array has ${document.data.length} rows, trimming for frontend preview`);
    document.data = document.data.slice(0, MAX_ROWS_TO_PREVIEW);
  }

  mainWindow.webContents.send(EVENT.PREPROCESSING_DONE, {
    isValid,
    isMappingDocument,
    document,
    errorFilePath,
    inputFilePath,
  });
}
