import {create as createStore} from 'zustand'
import * as intercomApi from './intercomApi'

export const SCREEN_BOOT = "Boot";
export const SCREEN_WELCOME = "Welcome";
export const SCREEN_MAIN = "Main";
export const SCREEN_FILE_LOADING = "FileLoading";

export const SCREEN_VALIDATION_SUCCESS = "ValidationSuccess";
export const SCREEN_VALIDATION_FAILED = "ValidationFailed";

export const SCREEN_PROCESSING_IN_PROGRESS = "ProcessingInProgress";
export const SCREEN_PROCESSING_FINISHED = "ProcessingFinished";
export const SCREEN_PROCESSING_CANCELED = "ProcessingCanceled";

export const SCREEN_LOAD_NEW_CONFIG = "LoadNewConfig";
export const SCREEN_CONFIG_UPDATED = "ConfigUpdated";
export const SCREEN_ERROR = "Error";
export const SCREEN_INVALID_CONFIG = "InvalidConfig";


export const useAppStore = createStore((set) => ({
    screen: SCREEN_BOOT,

    bears: 0,

    config: {
        lastUpdated: new Date(),
        data: {
            meta: {
                region: "UNKNOWN",
                version: "0.0.0",
            },
        },
        isBackup: false,
        // inidicate that the config has not yet changed since start
        isInitial: true,
    },

    updateConfig: (newConfig, isBackup) => set((state) => {
        return {
            ...state,
            config: {
                data: newConfig,
                lastUpdated: new Date(),
                isBackup,
            },
        };
    }),

    loadNewConfig: () => set(state => {
        // dispatch the open dialog + config update to the electron api
        intercomApi.loadNewConfig();

        return {
            screen: SCREEN_LOAD_NEW_CONFIG,
        }
    }),

    loadNewConfigDone: ({success, canceled, error, config, lastUpdated}) => set(state => {
        // if the load was OK update the config and go to the main screen
        if (success) {
            return {
                screen: SCREEN_CONFIG_UPDATED,
                config: {
                    data: config,
                    lastUpdated: lastUpdated,
                    // we just updated it so it's not a backup
                    isBackup: false,
                }
            };
        }

        // if the load was canceled go to the main screen with the old config
        if (canceled) {
            // handle cancelation of inital load when there was an error booting
            if (state.config.isInitial && state.errorMessage) {
                return {
                    config: {
                        data: config,
                        isInitial: true,
                    },
                    screen: SCREEN_INVALID_CONFIG,
                    errorMessage: state.errorMessage,
                }
            }
            return {
                screen: SCREEN_MAIN,
                config: state.config,
            };
        }

        // If we still have the initial config this means there is no valid config present
        // so fall back to the invalid config screen
        if (state.config.isInitial) {
            return {
                config: {
                    data: config,
                    isInitial: true,
                },
                screen: SCREEN_INVALID_CONFIG,
                errorMessage: error,
            }
        }

        // we had some errors -- show the error screen
        return {
            config: state.config,
            screen: SCREEN_ERROR,
            isRuntimeError: false,
            errorMessage: "Error in the configuration file: " + error,
        }

    }),

    // Startup of the application after config load -- initialize a main screen
    boot: ({config, lastUpdated, isBackup, error}) => set(state => {
        // TODO: if the backup config is also invalid show the "invalid config screen"
        // if (!newConfig.meta) {
        if (error) {
            return {
                config: {
                    data: config,
                    isInitial: true,
                },
                screen: SCREEN_INVALID_CONFIG,
                errorMessage: error,
            }
        }
        return {
            config: {
                data: config,
                lastUpdated,
                isBackup,
            },
            screen: SCREEN_WELCOME,
            // screen: SCREEN_MAIN,
        }
    }),

    // go back to the main screen and throw away any other state
    backToMainScreen: () => set(state => {
        return {
            config: state.config,
            screen: SCREEN_MAIN,
        }
    }),

    // When receiving a "processing canceled" (the user used "Cancel" in a file open or save dialog)
    // snow the Processing Canceled screen
    processingCanceled: () => set(state => {
        return {
            config: state.config,
            screen: SCREEN_PROCESSING_CANCELED,
        }
    }),

    // Trigger opening a file dialog and preprocessing the selected file
    preProcessFileOpenDialog: () => set(state => {
        console.log("hello")

        intercomApi.preProcessFileOpenDialog();

        return {
            // keep the config
            config: state.config,
            // update the screen type to FileLoading
            screen: SCREEN_FILE_LOADING,
            // clean the file name
            inputFilePath: "",
        }

    }),

    // Entry point for dropping / selecting a file path for processing
    startPreProcessingFile: (filePath) => set(state => {
        // trigger an intercom call
        intercomApi.startPreProcessingFile(filePath);
        //
        return {
            // keep the config
            config: state.config,
            // update the screen type to FileLoading
            screen: SCREEN_FILE_LOADING,
            // pass the file name
            inputFilePath: filePath,
        }
    }),

    // Signal from the Node backend that the validation step is finished, with
    preProcessingDone: ({inputFilePath, inputData, validationResult, validationErrorsOutputFile, validationResultDocument}) => set(state => {
        console.log("Preprocessing done", {inputFilePath, inputData, validationResult, validationErrorsOutputFile, validationResultDocument})
        // figure out if validation was a success or not
        const isValidationSuccess = !validationResult.some(sheet => !sheet.ok);


        if (isValidationSuccess) {
            return {
                config: state.config,
                screen: SCREEN_VALIDATION_SUCCESS,
                inputFilePath,
                inputData,
            }
        } else {
            return {
                config: state.config,
                screen: SCREEN_VALIDATION_FAILED,
                validationErrorsOutputFile,
                inputFilePath,
                inputData,
                validationResult,
                validationResultDocument,
            }
        }

    }),


    // Start processing the file using the given output location and porentially
    // output format
    startProcessingFile: (inputFilePath, outputLocation) => set(state => {
        intercomApi.startProcessingFile(inputFilePath, outputLocation);

        return {
            config: state.config,
            screen: SCREEN_PROCESSING_IN_PROGRESS,
            inputFilePath,
        }
    }),


    // Callback after the processing of the file is finished
    processingDone: ({outputFilePaths, outputData, mappingFilePaths}) => set(state => {
        console.log("processingDONE:", {outputFilePaths, mappingFilePaths})
        return {
            config: state.config,
            screen: SCREEN_PROCESSING_FINISHED,
            outputFilePath: outputFilePaths[0],
            outputData,
            mappingFilePath: mappingFilePaths[0],
        }
    }),

    // Open an output file using the OS default app
    openOutputFile: (outputFilePath) => set(state => {
        intercomApi.openOutputFile(outputFilePath);
        // no change here
        return state;
    }),


    // quit the application -- there is no state change after this
    quit: () => {
        intercomApi.quit();
    },


    // If an error occurs report it to the user via the apropriate screen
    reportError: (errorMessage) => set(state => {

        return {
            config: state.config,
            screen: SCREEN_ERROR,

            errorMessage,
            isRuntimeError: true,
        };
    })


  }))

