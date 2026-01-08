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
import type { ConfigStore } from '@wfp/common-identifier-algorithm-shared';

import { preProcessFile } from './preProcessFile';
import { EVENT } from '../../../common/events';

const ipcLog = log.scope("ipc:openDialogue"); 

// Shows a file open dialog and starts preprocessing the selected file
export async function preProcessFileOpenDialog(mainWindow: BrowserWindow, configStore: ConfigStore,) {
  const response = await dialog.showOpenDialog({
    properties: ['openFile'],
    filters: [{ name: 'CSV or XLSX files', extensions: ['csv', 'xlsx'] }],
  });
  if (!response.canceled) {
    // handle fully qualified file name
    const filePath = response.filePaths[0];
    ipcLog.info(`Starting to process file from open dialog: ${filePath}`);
    return preProcessFile(mainWindow, configStore, filePath);
  } else {
    ipcLog.warn('No file selected');
    // send the cancelec message
    mainWindow.webContents.send(EVENT.WORKFLOW_CANCELLED, {});
  }
}
