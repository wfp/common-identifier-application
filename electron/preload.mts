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

const ipcRenderer = createIpcRenderer<Api>();

const api: Api = {
  invoke: {
    getFilePath:              (file: File) => webUtils.getPathForFile(file),
    getPosixFilePath:         (file: File) => webUtils.getPathForFile(file),
    
    requestConfigUpdate:      async () => await ipcRenderer.invoke(EVENT.CONFIG_REQUEST_UPDATE),
    loadNewConfig:            async () => await ipcRenderer.invoke(EVENT.CONFIG_LOAD_NEW),
    removeUserConfig:         async () => await ipcRenderer.invoke(EVENT.CONFIG_REMOVE),

    acceptTermsAndConditions: () => ipcRenderer.send(EVENT.ACCEPT_TERMS_AND_CONDITIONS),
    preProcessFileOpenDialog: () => ipcRenderer.send(EVENT.PREPROCESSING_START_DIALOGUE),
    fileDropped:              (fileName: string) => ipcRenderer.send(EVENT.PREPROCESSING_START_DROP, fileName),
    processFile:              (fileName: string) => ipcRenderer.send(EVENT.PROCESSING_START, fileName),
    openOutputFile:           (fileName: string) => ipcRenderer.send(EVENT.OPEN_OUTPUT_FILE, fileName),

    quit: () => ipcRenderer.send(EVENT.QUIT)
  },
  on: {
    // if unexpected errors occur this gets triggered
    error:               (listener) => ipcRenderer.on(EVENT.ERROR, listener),
    configChanged:       (listener) => ipcRenderer.on(EVENT.CONFIG_CHANGED, listener),
    processingDone:      (listener) => ipcRenderer.on(EVENT.PROCESSING_FINISHED, listener),
    preprocessingDone:   (listener) => ipcRenderer.on(EVENT.PREPROCESSING_FINISHED, listener),
    processingCancelled: (listener) => ipcRenderer.on(EVENT.WORKFLOW_CANCELLED, listener),
  }
}

contextBridge.exposeInMainWorld('electronAPI', api);