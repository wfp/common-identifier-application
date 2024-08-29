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

const EVENT_QUIT = "quit";
const EVENT_ERROR = "error";

contextBridge.exposeInMainWorld('electronAPI', {
    // RPC call to fetch the app config
    requestConfigUpdate: () => { return ipcRenderer.invoke(EVENT_REQUEST_CONFIG_UPDATE); },

    // RPC call to load a new config via a dialog
    loadNewConfig: () => { return ipcRenderer.invoke(EVENT_LOAD_NEW_CONFIG); },

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

})