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

import { BrowserWindow, dialog } from 'electron';
import { preProcessFile } from './preProcessFile';
import type { ConfigStore } from 'common-identifier-algorithm-shared';

import Debug from 'debug';
const log = Debug('CID:main:ipc::preProcessFileOpenDialog');

interface IPCPreProcessFileOpenDialogInput {
  mainWindow: BrowserWindow;
  configStore: ConfigStore;
}

// Shows a file open dialog and starts preprocessing the selected file
export async function preProcessFileOpenDialog({
  mainWindow,
  configStore,
}: IPCPreProcessFileOpenDialogInput) {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV or XLSX files', extensions: ['csv', 'xlsx'] }],
  });
  if (!response.canceled) {
    // handle fully qualified file name
    const filePath = response.filePaths[0];
    log('Starting to process file from open dialog: ',filePath);
    return preProcessFile({ mainWindow, configStore, filePath });
  } else {
    log('no file selected');
    // send the cancelec message
    mainWindow.webContents.send('processingCancelled', {});
  }
}
