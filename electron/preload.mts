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

import { contextBridge, createIpcRenderer } from 'electron-typescript-ipc';
import { EVENT } from '../common/events';
import type { Api } from '../common/api';
import { webUtils } from 'electron';
import path from 'node:path';

const ipcRenderer = createIpcRenderer<Api>();

const api: Api = {
  invoke: {
    loadSystemConfig:         () => ipcRenderer.invoke(EVENT.CONFIG_LOAD_SYSTEM),
    loadNewConfig:            () => ipcRenderer.invoke(EVENT.CONFIG_LOAD_NEW),
    removeConfig:         () => ipcRenderer.invoke(EVENT.CONFIG_REMOVE),

    acceptTermsAndConditions: () => ipcRenderer.send(EVENT.ACCEPT_TERMS_AND_CONDITIONS),
    validateFileOpenDialogue: () => ipcRenderer.send(EVENT.VALIDATION_START_DIALOGUE),
    validateFileDropped:      (fileName: string) => ipcRenderer.send(EVENT.VALIDATION_START_DROP, fileName),
    processFile:              (fileName: string) => ipcRenderer.send(EVENT.PROCESSING_START, fileName),

    encryptFile:              (fileName: string) => ipcRenderer.send(EVENT.ENCRYPTION_START, fileName),

    openOutputFile:           (fileName: string) => ipcRenderer.send(EVENT.OPEN_OUTPUT_FILE, fileName),
    revealInDirectory:        (filePath: string) => ipcRenderer.send(EVENT.REVEAL_IN_DIRECTORY, filePath),

    getFilePath:              (file: File) => webUtils.getPathForFile(file),
    getPosixFilePath:         (file: File) => {
      const p = webUtils.getPathForFile(file);
      return p ? path.posix.normalize(p.replace(/\\/g, '/')) : undefined;
    },

    unsubscribe: (event: EVENT, handler: (...args: any[]) => void) => ipcRenderer.removeListener(event, handler),

    quit: () => ipcRenderer.send(EVENT.QUIT)
  },
  on: {
    // if unexpected errors occur this gets triggered
    error:               (listener) => ipcRenderer.on(EVENT.ERROR, listener),
    processingDone:      (listener) => ipcRenderer.on(EVENT.PROCESSING_FINISHED, listener),
    validationDone:      (listener) => ipcRenderer.on(EVENT.VALIDATION_FINISHED, listener),
    processingCancelled: (listener) => ipcRenderer.on(EVENT.WORKFLOW_CANCELLED, listener),
    encryptionDone:      (listener) => ipcRenderer.on(EVENT.ENCRYPTION_FINISHED, listener),
  }
}

contextBridge.exposeInMainWorld('electronAPI', api);