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

import { useAppStore } from './store';

const EVENT_PREPROCESSING_STARTED = 'preprocessing_started';
const EVENT_PROCESSING_STARTED = 'processing_started';

function defer(timeout) {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
}

function withElectronAPI(label, fn, elseFn = () => {}) {
  if (typeof electronAPI === 'object') {
    console.log('[IPC] Callong Electron API', label);
    return fn(electronAPI);
  } else {
    console.log('[IPC] Cannot find electrom API');
    return elseFn();
  }
}

// Send a file path to the backend for processing.
// The resulting callback should trigger the "preprocessingDoneCallback" function
export function startPreProcessingFile(filePath) {
  const event = {
    type: EVENT_PREPROCESSING_STARTED,
    filePath: filePath,
  };

  // dispatch the event to the electron api
  withElectronAPI('fileDropped', (electronAPI) => {
    console.log('Calling Electron with file path', filePath);
    electronAPI.fileDropped(filePath);
  });
}

withElectronAPI('registerCallbacks', (electronAPI) => {
  // preprocessing done hook
  electronAPI.onPreprocessingDone((value) => {
    console.log('Received preprocessing done with: ', value);

    useAppStore.getState().preProcessingDone(value);
    // const { inputFilePath, inputData, validationResult, validationErrorsOutputFile, validationResultDocument} = value;
    // preprocessingDoneCallback(value)
  });

  // preprocessing done hook
  electronAPI.onProcessingDone((value) => {
    console.log('Received processing done with: ', value);
    // const {outputFilePath, outputData, mappingFilePaths} = value;
    // preprocessingDoneCallback(inputFilePath, inputData, validationResult)
    // processingDoneCallback(outputFilePath[0], outputData, mappingFilePaths[0]);
    useAppStore.getState().processingDone(value);
  });

  // Config changes
  electronAPI.onConfigChanged((newConfig) => {
    console.log('Received configChanged with:', newConfig);
    const updateConfig = useAppStore.getState().updateConfig;
    updateConfig(newConfig.config, newConfig.isBackup);
  });

  // Porcessing cancelation hook
  electronAPI.onProcessingCanceled(() => {
    console.log('Received processing canceled');
    useAppStore.getState().processingCanceled();
  });

  electronAPI.onError((errorMessage) => {
    console.log('Received error message', errorMessage);
    useAppStore.getState().reportError(errorMessage);
  });
});

// BOOT
// ----
withElectronAPI('Boot', (electronAPI) => {
  // Initial config load request (trigger config update on boot)
  electronAPI.requestConfigUpdate().then((newConfig) => {
    console.log('Received initial config update with:', newConfig);
    useAppStore.getState().boot(newConfig);
  });
});

// // propagate the results of the preprocessing to the UI
// function preprocessingDoneCallback(filePath, inputData, validationResult, validationErrorsOutputFile) {
//     const preProcessingDone = useAppStore.getState().preProcessingDone;

//     preProcessingDone(filePath, inputData, validationResult, validationErrorsOutputFile);
// }

export function startProcessingFile(filePath, outputLocation) {
  const event = {
    type: EVENT_PROCESSING_STARTED,
    filePath: filePath,
  };

  // dispatch the event to the electron api
  withElectronAPI('startProcessing', (electronAPI) => {
    console.log('Callong Electron with file path', filePath);
    electronAPI.processFile(filePath);
  });
}

function processingDoneCallback(outputFilePath, outputData) {
  const processingDone = useAppStore.getState().processingDone;

  processingDone(outputFilePath, outputData);
}

export function preProcessFileOpenDialog() {
  // dispatch the event to the electron api
  withElectronAPI(
    'preProcessFileOpenDialog',
    (electronAPI) => {
      console.log('Calling Electron for open dialog');
      electronAPI.preProcessFileOpenDialog();
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN W/ DIALOG');
    },
  );
}

export function openOutputFile(filePath) {
  withElectronAPI(
    'openOutputFile',
    (electronAPI) => {
      console.log('Calling Electron to open an output file');
      electronAPI.openOutputFile(filePath);
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN OUTPUT');
    },
  );
}

// Open a new config file via a dialog on the backend
export function loadNewConfig() {
  withElectronAPI(
    'loadNewConfig',
    (electronAPI) => {
      console.log('Calling Electron to open a new config');

      return electronAPI.loadNewConfig().then((v) => {
        useAppStore.getState().loadNewConfigDone(v);
      });
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN CONFIG');
    },
  );
}

export function removeUserConfig() {
  withElectronAPI(
    'removeUserConfig',
    (electronAPI) => {
      console.log('Calling Electron to fall back to the backup configuration');

      return electronAPI.removeUserConfig().then((v) => {
        useAppStore.getState().userConfigRemoved(v);
      });
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN CONFIG');
    },
  );
}

// Quit the application
export function quit() {
  withElectronAPI('quit', (electronAPI) => {
    electronAPI.quit();
  });
}

// Mark the current config's terms and conditions accepted
export function acceptTermsAndConditions() {
  withElectronAPI('acceptTermsAndConditions', (electronAPI) => {
    electronAPI.acceptTermsAndConditions();
  });
}
