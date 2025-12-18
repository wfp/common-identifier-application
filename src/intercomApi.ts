// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
import { useAppStore } from './store';

import Debug from 'debug';
const log = Debug('cid::renderer::intercom');

function withElectronAPI(label: string, fn: CallableFunction, elseFn = () => {}) {
  if (typeof window.electronAPI === 'object') {
    console.log('[IPC] Calling Electron API', label);
    return fn(window.electronAPI);
  } else {
    console.log('[IPC] Cannot find Electron API');
    return elseFn();
  }
}

withElectronAPI('registerCallbacks', () => {
  log("registerCallbacks")
  // preprocessing done hook
  window.electronAPI.on.preprocessingDone((_, value) => {
    console.log('Received preprocessing done with: ', value);
    useAppStore.getState().preProcessingDone(value);
  });

  // preprocessing done hook
  window.electronAPI.on.processingDone((_, value) => {
    console.log('Received processing done with: ', value);
    useAppStore.getState().processingDone(value);
  });

  // Config changes
  window.electronAPI.on.configChanged((_, newConfig) => {
    console.log('Received configChanged with:', newConfig);
    const updateConfig = useAppStore.getState().updateConfig;
    updateConfig(newConfig.config, newConfig.isBackup);
  });

  // Porcessing cancelation hook
  window.electronAPI.on.processingCancelled((_) => {
    console.log('Received processing cancelled');
    useAppStore.getState().processingCancelled();
  });

  window.electronAPI.on.error((_, errorMessage) => {
    console.log('Received error message', errorMessage);
    useAppStore.getState().reportError(errorMessage);
  });
});

// BOOT
// ----

withElectronAPI('Boot', () => {
  log("boot")
    // Initial config load request (trigger config update on boot)
    window.electronAPI.invoke.requestConfigUpdate().then((newConfig) => {
        useAppStore.getState().boot(newConfig);
    });
});

export function getFilePath(file: File) {
  log("getFilePath - calling Electron with file", file);
  const filePath = window.electronAPI.invoke.getFilePath(file);
  return filePath;
}

// Send a file path to the backend for processing.
// The resulting callback should trigger the "preprocessingDoneCallback" function
export function startPreProcessingFile(filePath: string) {
    log("start preprocessingFile")
    // dispatch the event to the electron api
    withElectronAPI('fileDropped', () => {
      console.log('Calling Electron with file path', filePath);
      window.electronAPI.invoke.fileDropped(filePath);
    });
  }

export function startProcessingFile(filePath: string) {
  // dispatch the event to the electron api
  withElectronAPI('startProcessing', () => {
    console.log('Callong Electron with file path', filePath);
    window.electronAPI.invoke.processFile(filePath);
  });
}

export function preProcessFileOpenDialog() {
  // dispatch the event to the electron api
  withElectronAPI(
    'preProcessFileOpenDialog',
    () => {
      console.log('Calling Electron for open dialog');
      window.electronAPI.invoke.preProcessFileOpenDialog();
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN W/ DIALOG');
    },
  );
}

export function openOutputFile(filePath: string) {
  withElectronAPI(
    'openOutputFile',
    () => {
      console.log('Calling Electron to open an output file');
      window.electronAPI.invoke.openOutputFile(filePath);
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN OUTPUT');
    },
  );
}

// Open a new config file via a dialog on the backend
export function loadNewConfig() {
  withElectronAPI('loadNewConfig', async () => {
      console.log('Calling Electron to open a new config');

      const v = await window.electronAPI.invoke.loadNewConfig();
      useAppStore.getState().loadNewConfigDone(v);
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN CONFIG');
    },
  );
}

export function removeUserConfig() {
  withElectronAPI('removeUserConfig', async () => {
      console.log('Calling Electron to fall back to the backup configuration');
      const v = await window.electronAPI.invoke.removeUserConfig();
      useAppStore.getState().userConfigRemoved(v);
    },
    () => {
      console.log('NO FALLBACK FOR ELECTRON-LESS OPEN CONFIG');
    },
  );
}

// Mark the current config's terms and conditions accepted
export function acceptTermsAndConditions() {
  log(":acceptTermsAndConditions");
  withElectronAPI('acceptTermsAndConditions', () => {
    window.electronAPI.invoke.acceptTermsAndConditions();
  });
}

// Quit the application
export function quit() {
    window.electronAPI.invoke.quit();
}
