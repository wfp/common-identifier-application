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

import { contextBridge, createIpcRenderer } from 'electron-typescript-ipc';
import type { Api } from '../api.js';
import { EVENT } from './types.js';

const ipcRenderer = createIpcRenderer<Api>();

const api: Api = {
  invoke: {
    requestConfigUpdate: () => ipcRenderer.invoke(EVENT.REQUEST_CONFIG_UPDATE),
    loadNewConfig: () => ipcRenderer.invoke(EVENT.LOAD_NEW_CONFIG),
    removeUserConfig: () => ipcRenderer.invoke(EVENT.REMOVE_USER_CONFIG),
    
    acceptTermsAndConditions: () => ipcRenderer.send(EVENT.ACCEPT_TERMS_AND_CONDITIONS),
    fileDropped: async (fileName: string) => ipcRenderer.send(EVENT.FILE_DROPPED, fileName),
    processFile: async (fileName: string) => ipcRenderer.send(EVENT.PROCESS_FILE, fileName),
    preProcessFileOpenDialog:  async () => ipcRenderer.send(EVENT.PREPROCESS_FILE_OPEN_DIALOG, {}),
    openOutputFile: async (fileName: string) => ipcRenderer.send(EVENT.OPEN_OUTPUT_FILE, fileName),

    quit: () => ipcRenderer.send(EVENT.QUIT)
  },
  on: {
    // if unexpected errors occur this gets triggered
    error: (listener) =>               ipcRenderer.on(EVENT.ERROR, listener),
    configChanged: (listener) =>       ipcRenderer.on(EVENT.CONFIG_CHANGED, listener),
    processingDone: (listener) =>      ipcRenderer.on(EVENT.PROCESSING_DONE, listener),
    preprocessingDone: (listener) =>   ipcRenderer.on(EVENT.PREPROCESSING_DONE, listener),
    processingCancelled: (listener) => ipcRenderer.on(EVENT.PROCESSING_CANCELLED, listener),
  }
}

contextBridge.exposeInMainWorld('electronAPI', api);
declare global {
  interface Window {
    electronAPI: Api
  }
}