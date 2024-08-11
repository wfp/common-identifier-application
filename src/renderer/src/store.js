import {create as createStore} from 'zustand'
import * as intercomApi from './intercomApi'

export const SCREEN_BOOT = "Boot";
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
                region: "NWS",
                version: "1.0.8",
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
            console.log("AFTER CANCEL", state.config);
            // handle cancelation of inital load when there was an error booting
            if (state.config.isInitial && state.errorMessage) {
                return {
                    screen: SCREEN_INVALID_CONFIG,
                    errorMessage: state.errorMessage,
                }
            }
            return {
                screen: SCREEN_MAIN,
                config: state.config,
            };
        }

        // we had some errors -- show the error screen
        return {
            config: state.config,
            screen: SCREEN_ERROR,
            errorMessage: "Error in the configuration file: " + error,
        }

    }),

    // Startup of the application after config load -- initialize a main screen
    boot: (newConfig, lastUpdated, isBackup, error) => set(state => {
        // TODO: if the backup config is also invalid show the "invalid config screen"
        if (!newConfig.meta) {
            return {
                screen: SCREEN_INVALID_CONFIG,
                errorMessage: error,
            }
        }
        return {
            config: {
                data: newConfig,
                lastUpdated,
                isBackup,
            },
            screen: SCREEN_MAIN,
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
            // pass the file name
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
    preProcessingDone: (inputFilePath, inputData, validationResult, validationErrorsOutputFile) => set(state => {
        console.log("Preprocessing done", {inputFilePath, inputData, validationResult, validationErrorsOutputFile})
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
    processingDone: (outputFilePath, outputData) => set(state => {
        return {
            config: state.config,
            screen: SCREEN_PROCESSING_FINISHED,
            outputFilePath,
            outputData,
        }
    }),

    // Open an output file using the OS default app
    openOutputFile: (outputFilePath) => set(state => {
        intercomApi.openOutputFile(outputFilePath);
        // no change here
        return state;
    }),



  }))

