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

const { contextBridge, ipcRenderer } = require('electron')
const path = require('node:path')

const EVENT_FILE_DROPPED = "fileDropped";
const EVENT_PREPROECSSING_DONE = "preprocessingDone";
const EVENT_PROCESS_FILE = "processFile";
const EVENT_PROCESSING_DONE = "processingDone";
const EVENT_PREPROCESS_FILE_OPEN_DIALOG = "preProcessFileOpenDialog";
const EVENT_PROCESSING_CANCELED = "processingCanceled";
const EVENT_OPEN_OUTPUT_FILE = "openOutputFile";

const EVENT_CONFIG_CHANGED = "configChanged";
const EVENT_REQUEST_CONFIG_UPDATE = "requestConfigUpdate";
const EVENT_LOAD_NEW_CONFIG = "loadNewConfig";
const EVENT_REMOVE_USER_CONFIG = "removeUserConfig";

const EVENT_QUIT = "quit";
const EVENT_ERROR = "error";
const EVENT_ACCEPT_TERMS_AND_CONDITIONS = "acceptTermsAndConditions";


contextBridge.exposeInMainWorld('electronAPI', {
    // RPC call to fetch the app config
    requestConfigUpdate: () => { return ipcRenderer.invoke(EVENT_REQUEST_CONFIG_UPDATE); },

    // RPC call to load a new config via a dialog
    loadNewConfig: () => { return ipcRenderer.invoke(EVENT_LOAD_NEW_CONFIG); },

    // RPC call to fall back to the backup config
    removeUserConfig: () => { return ipcRenderer.invoke(EVENT_REMOVE_USER_CONFIG); },

    // callback if the config has changed
    onConfigChanged: (callback) => {
        ipcRenderer.on(EVENT_CONFIG_CHANGED, (_event, value) => callback(value))
    },

    // Pre-processing
    fileDropped: (fileName) => {
        return ipcRenderer.send(EVENT_FILE_DROPPED, fileName)
    },
    onPreprocessingDone: (callback) => {
        ipcRenderer.on(EVENT_PREPROECSSING_DONE, (_event, value) => callback(value))
    },

    // Processing
    processFile: (fileName) => {
        return ipcRenderer.send(EVENT_PROCESS_FILE, fileName)
    },
    onProcessingDone: (callback) => {
        ipcRenderer.on(EVENT_PROCESSING_DONE, (_event, value) => callback(value))
    },

    // open a file with a dialog and preprocess it
    preProcessFileOpenDialog: () => {
        return ipcRenderer.send(EVENT_PREPROCESS_FILE_OPEN_DIALOG, {})
    },

    // callback if the processing is canceled
    onProcessingCanceled: (callback) => {
        ipcRenderer.on(EVENT_PROCESSING_CANCELED, (_event, value) => callback(value))
    },


    // if unexpected errors occur this gets triggered
    onError: (callback) => {
        ipcRenderer.on(EVENT_ERROR, (_event, value) => callback(value))
    },

    // open an output file using the OS default app
    openOutputFile: (fileName) => {
        return ipcRenderer.send(EVENT_OPEN_OUTPUT_FILE, fileName)
    },

    quit: () => {
        return ipcRenderer.send(EVENT_QUIT)
    },

    acceptTermsAndConditions: () => {
        return ipcRenderer.send(EVENT_ACCEPT_TERMS_AND_CONDITIONS);
    }

})