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

import { create as createStore } from 'zustand';
import * as intercomApi from './intercomApi.js';
import type { CidDocument, Config } from './types.js';
import type { BaseState, IBoot, ILoadConfigFailed, ILoadConfigFinished, IProcessingBegin, IProcessingFinished, IValidationBegin, IValidationFailed, IValidationSuccess } from './types.js';

import Debug from 'debug';
const log = Debug('CID:Renderer::store');

export enum SCREENS {
  BOOT = 'Boot',
  WELCOME = 'Welcome',
  MAIN = 'Main',
  FILE_LOADING = 'FileLoading',

  VALIDATION_SUCCESS = 'ValidationSuccess',
  VALIDATION_FAILED = 'ValidationFailed',

  PROCESSING_IN_PROGRESS = 'ProcessingInProgress',
  PROCESSING_FINISHED = 'ProcessingFinished',
  PROCESSING_CANCELLED = 'ProcessingCancelled',

  LOAD_NEW_CONFIG = 'LoadNewConfig',
  CONFIG_UPDATED = 'ConfigUpdated',
  ERROR = 'Error',
  INVALID_CONFIG = 'InvalidConfig',
  CONFIG_CHANGE = 'ConfigChange',
}

export interface BaseAppState {
  screen: SCREENS;
  config: {
    isBackup: boolean;
    isInitial: boolean;

    lastUpdated: Date;
    data: Config.Options;
  }
  inputFilePath?: string;
  outputFilePath?: string;
  mappingFilePath?: string;
  errorFilePath?: string;
  document?: CidDocument;
  errorMessage?: string;
  isRuntimeError?: boolean;
  isMappingDocument?: boolean;
}

interface AppState extends BaseAppState {
  boot: ({ config, lastUpdated, isBackup, error, hasAcceptedTermsAndConditions } : {
    config: Config.Options,
    lastUpdated: Date,
    isBackup: boolean,
    error: string,
    hasAcceptedTermsAndConditions: boolean
  }) => void;
  updateConfig: (newConfig: Config.Options, isBackup: boolean) => void;
  loadNewConfig: () => void;
  loadNewConfigDone: ({ success, cancelled, error, config, lastUpdated }: {
    success: boolean, cancelled: boolean, error: string, config: Config.Options, lastUpdated: Date
  }) => void;
  removeUserConfig: () => void;
  userConfigRemoved: ({ success, error, config, lastUpdated} : {
    success: boolean, error: string, config: Config.Options, lastUpdated: Date
  }) => void;
  startConfigChange: () => void;
  backToMainScreen: () => void;
  showTermsAndConditions: () => void;
  acceptTermsAndConditions: () => void;
  processingCancelled: () => void;
  preProcessFileOpenDialog: () => void;
  startPreProcessingFile: (filePath: string) => void;
  preProcessingDone: ({ isValid, isMappingDocument, document, inputFilePath, errorFilePath } : {
    isValid: boolean,
    isMappingDocument: boolean,
    document: CidDocument,
    inputFilePath: string,
    errorFilePath: string
  }) => void;
  startProcessingFile: (inputFilePath: string, outputLocation: string) => void;
  processingDone: ({ isMappingDocument, document, outputFilePath, mappingFilePath }: {
    isMappingDocument: boolean,
    document: CidDocument,
    outputFilePath: string,
    mappingFilePath: string,
  }) => void;
  openOutputFile: (outputFilePath: string) => void;
  quit: () => void;
  reportError: (errorMessage: string) => void;
}

export const useAppStore = createStore<AppState>()((set) => ({
  screen: SCREENS.BOOT,
  config: {
    isInitial: true,
    isBackup: false,
    lastUpdated: new Date(),
    // @ts-ignore
    data: { meta: { region: "UNKNOWN", version: "0.0.0", signature: ""}},
  },
  boot: ({ config, lastUpdated, isBackup, error, hasAcceptedTermsAndConditions }) => set((): IBoot => {
    console.log("BOOT");
    // TODO: if the backup config is also invalid show the "invalid config screen"
    if (error) return {
      config: { data: config, isInitial: true, isBackup: false, lastUpdated: lastUpdated },
      screen: SCREENS.INVALID_CONFIG,
      errorMessage: error
    }
    return {
      screen: hasAcceptedTermsAndConditions ? SCREENS.MAIN : SCREENS.WELCOME,
      config: { data: config, lastUpdated, isBackup, isInitial: false },
    };
  }),
  // updateConfig: (newConfig, isBackup) => set((state): BaseState => ({
  //   screen: state.screen,
  //   config: { isInitial: false, isBackup: isBackup, data: newConfig, lastUpdated: new Date() }
  // })),
  updateConfig: (newConfig, isBackup) => set((state): BaseState => {
    console.log("UPDATE_CONFIG");
    console.log(state);
    return {
      screen: state.screen,
      config: { isInitial: false, isBackup: isBackup, data: newConfig, lastUpdated: new Date() }
    }
  }),
  loadNewConfig: () => set(() => {
    console.log("LOAD_NEW_CONFIG");
    intercomApi.loadNewConfig();
    return { screen: SCREENS.LOAD_NEW_CONFIG }
  }),
  loadNewConfigDone: ({ success, cancelled, error, config, lastUpdated }) => set((state): ILoadConfigFinished | ILoadConfigFailed => {
    console.log("LOAD_NEW_CONFIG_DONE");
    // if the load was OK update the config and go to the main screen
    if (success) return {
      screen: SCREENS.CONFIG_UPDATED,
      config: { data: config, lastUpdated: lastUpdated, isInitial: false, isBackup: false }
    }
    // if the load was cancelled go to the main screen with the old config
    if (cancelled) {
      // handle cancelation of inital load when there was an error booting
      if (state.config.isInitial && state.errorMessage) return {
        screen: SCREENS.INVALID_CONFIG,
        config: { data: config, isInitial: true, isBackup: false, lastUpdated: lastUpdated },
        isRuntimeError: false,
        errorMessage: state.errorMessage
      }
      return { screen: SCREENS.MAIN, config: state.config }
    }
    // If we still have the initial config this means there is no valid config present
    // so fall back to the invalid config screen
    if (state.config.isInitial) return {
      screen: SCREENS.INVALID_CONFIG,
      config: { data: config, isInitial: true, isBackup: false, lastUpdated: lastUpdated },
      isRuntimeError: false,
      errorMessage: error
    }
    // we had some errors -- show the error screen
    return {
      config: state.config,
      screen: SCREENS.ERROR,
      isRuntimeError: false,
      errorMessage: 'Error in the configuration file: ' + error,
    };
  }),
  removeUserConfig: () => set(state => {
    console.log("REMOVE_USER_CONFIG");
    intercomApi.removeUserConfig();
    return { config: state.config, screen: SCREENS.LOAD_NEW_CONFIG }
  }),
  userConfigRemoved: ({ success, error, config, lastUpdated}) => set((state): ILoadConfigFinished | ILoadConfigFailed => {
    console.log("USER_CONFIG_REMOVED");
    if (!success) return {
      config: state.config, screen: SCREENS.ERROR, isRuntimeError: false,
      errorMessage: 'Error in the backup configuration file: ' + error,
    }
    return {
      screen: SCREENS.CONFIG_UPDATED,
      config: {
        data: config,
        lastUpdated: lastUpdated,
        isBackup: true,
        isInitial: false
      }
    }
  }),
  startConfigChange: () => set((state): BaseState => {
    console.log("START_CONFIG_CHANGE");
    return { config: state.config, screen: SCREENS.CONFIG_CHANGE }
  }),
  backToMainScreen: () => set((state): BaseState => {
    console.log("BACK_TO_MAIN_SCREEN");
    return { config: state.config, screen: SCREENS.MAIN }
  }),
  showTermsAndConditions: () => set((state): BaseState => {
    console.log("SHOW_TERMS_AND_CONDITIONS");
    return { config: state.config, screen: SCREENS.WELCOME }
  }),
  acceptTermsAndConditions: () => set((state): BaseState => {
    console.log("ACCEPT_TERMS_AND_CONDITIONS");
    intercomApi.acceptTermsAndConditions()
    return { config: state.config, screen: SCREENS.MAIN }
  }),
  processingCancelled: () => set((state): BaseState => {
    console.log("PROCESSING_CANCELLED");
    return { config: state.config, screen: SCREENS.PROCESSING_CANCELLED }
  }),
  
  preProcessFileOpenDialog: () => set((state): BaseState => {
    console.log("PRE_PROCESS_FILE_OPEN_DIALOG");
    intercomApi.preProcessFileOpenDialog();
    return {
      config: state.config,
      screen: SCREENS.FILE_LOADING,
    }
  }),
  startPreProcessingFile: (filePath) => set((state): IValidationBegin => {
    console.log("START_PRE_PROCESSING_FILE");
    intercomApi.startPreProcessingFile(filePath);
    return {
      config: state.config,
      screen: SCREENS.FILE_LOADING,
      inputFilePath: filePath,
    }
  }),
  preProcessingDone: ({ isValid, isMappingDocument, document, inputFilePath, errorFilePath }) => set((state): IValidationSuccess | IValidationFailed => {
    console.log("PRE_PROCESSING_DONE");
      if (isValid) return {
        screen: SCREENS.VALIDATION_SUCCESS, config: state.config,
        inputFilePath,
        document, isMappingDocument
      }
      return {
        screen: SCREENS.VALIDATION_FAILED, config: state.config,
        inputFilePath, errorFilePath,
        document, isMappingDocument
      }
  }),

  startProcessingFile: (inputFilePath) => set((state): IProcessingBegin => {
    console.log("START_PROCESSING_FILE");
    intercomApi.startProcessingFile(inputFilePath);
    return { screen: SCREENS.PROCESSING_IN_PROGRESS, config: state.config, inputFilePath };
  }),

  processingDone: ({ isMappingDocument, document, outputFilePath, mappingFilePath }) => set((state): IProcessingFinished => {
    console.log("PROCESSING_DONE");
    return {
      screen: SCREENS.PROCESSING_FINISHED, config: state.config,
      isMappingDocument, document,
      outputFilePath, mappingFilePath,
    };
  }),

  openOutputFile: (outputFilePath) => set((state) => {
    console.log("OPEN_OUTPUT_FILE");
      intercomApi.openOutputFile(outputFilePath);
      return state;
    }),
    
  reportError: (errorMessage: string) => set((state) => {
    console.log("REPORT_ERROR");
    return { config: state.config, screen: SCREENS.ERROR, errorMessage, isRuntimeError: true,
    };
  }),

  quit: () => {
    console.log("QUIT");
    intercomApi.quit()
  }
}));