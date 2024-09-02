import {INPUT_DATA, VALIDATION_RESULT, OUTPUT_DATA} from "./testdata";

import {useAppStore} from "./store"

import { unstable_batchedUpdates } from 'react-dom'
const EVENT_PREPROCESSING_STARTED = "preprocessing_started";
const EVENT_PROCESSING_STARTED = "processing_started";

function defer(timeout) {
    return new Promise((resolve, reject) => {
        setTimeout(()=> {
            resolve();
        }, timeout);
    })

}

function withElectronAPI(label, fn, elseFn=() => {}) {
    if (typeof electronAPI === 'object') {
        console.log("Callong Electron API", label)
        return fn(electronAPI);
    } else {
        console.log("Cannot find electrom API")
        return elseFn();
    }
}


// Send a file path to the backend for processing.
// The resulting callback should trigger the "preprocessingDoneCallback" function
export function startPreProcessingFile(filePath) {
    const event = {
        type: EVENT_PREPROCESSING_STARTED,
        filePath: filePath,
    }


    // dispatch the event to the electron api
    withElectronAPI("fileDropped", (electronAPI) => {
        console.log("Callong Electron with file path", filePath)
        electronAPI.fileDropped(filePath);
    }, () => {
        // simulate a response
        defer(500).then(() => {
            console.log("TRIGGERING FAKE DONE CALLBACK")
            let validationResult = VALIDATION_RESULT;
            // randomize the validation for testing
            // if (Math.random() > 0.5) {
                // validationResult[0].ok = true;
            // }
            preprocessingDoneCallback(filePath, INPUT_DATA, validationResult, "<NO FILE>");
        })
    })


}

withElectronAPI("registerCallbacks", (electronAPI) => {

    // preprocessing done hook
    electronAPI.onPreprocessingDone((value) => {
        console.log("Received preprocessing done with: ", value);
        // const { inputFilePath, inputData, validationResult, validationErrorsOutputFile, validationResultDocument} = value;
        preprocessingDoneCallback(value)
    });

    // preprocessing done hook
    electronAPI.onProcessingDone((value) => {
        console.log("Received processing done with: ", value);
        // const {outputFilePath, outputData, mappingFilePaths} = value;
        // preprocessingDoneCallback(inputFilePath, inputData, validationResult)
        // processingDoneCallback(outputFilePath[0], outputData, mappingFilePaths[0]);
        useAppStore.getState().processingDone(value);

    });

    // Config changes
    electronAPI.onConfigChanged((newConfig) => {
        console.log("Received configChanged with:", newConfig);
        const updateConfig = useAppStore.getState().updateConfig;
        updateConfig(newConfig.config, newConfig.isBackup);
    });

    // Porcessing cancelation hook
    electronAPI.onProcessingCanceled(() => {
        console.log("Received processing canceled");
        useAppStore.getState().processingCanceled();
    });


    electronAPI.onError((errorMessage) => {
        console.log("Received error message", errorMessage)
        useAppStore.getState().reportError(errorMessage);
    });
})

// BOOT
// ----
withElectronAPI("Boot", (electronAPI) => {

    // Initial config load request (trigger config update on boot)
    electronAPI.requestConfigUpdate().then(newConfig => {
        console.log("Received initial config update with:", newConfig);
        useAppStore.getState().boot(newConfig);
    })
})


// propagate the results of the preprocessing to the UI
function preprocessingDoneCallback(filePath, inputData, validationResult, validationErrorsOutputFile) {
    const preProcessingDone = useAppStore.getState().preProcessingDone;

    preProcessingDone(filePath, inputData, validationResult, validationErrorsOutputFile);
}


export function startProcessingFile(filePath, outputLocation) {
    const event = {
        type: EVENT_PROCESSING_STARTED,
        filePath: filePath,
    }

    // dispatch the event to the electron api
    withElectronAPI("startProcessing", (electronAPI) => {
        console.log("Callong Electron with file path", filePath)
        electronAPI.processFile(filePath);
    }, () => {
        defer(500).then(() => {
            let outputData = OUTPUT_DATA;
            processingDoneCallback(filePath, outputData);
        })
    });
}


function processingDoneCallback(outputFilePath, outputData) {

    const processingDone = useAppStore.getState().processingDone;

    processingDone(outputFilePath, outputData);
}


export function preProcessFileOpenDialog() {

    // dispatch the event to the electron api
    withElectronAPI("preProcessFileOpenDialog", (electronAPI) => {
        console.log("Calling Electron for open dialog")
        electronAPI.preProcessFileOpenDialog();
    }, () => {
        console.log("NO FALLBACK FOR ELECTRON-LESS OPEN W/ DIALOG")
    });
}

export function openOutputFile(filePath) {
    withElectronAPI("openOutputFile", (electronAPI) => {
        console.log("Calling Electron to open an output file")
        electronAPI.openOutputFile(filePath);
    }, () => {
        console.log("NO FALLBACK FOR ELECTRON-LESS OPEN OUTPUT")
    });
}

// Open a new config file via a dialog on the backend
export function loadNewConfig() {
    withElectronAPI("loadNewConfig", (electronAPI) => {
        console.log("Calling Electron to open a new config")

        return electronAPI.loadNewConfig().then(v => {
            useAppStore.getState().loadNewConfigDone(v);
        });
    }, () => {
        console.log("NO FALLBACK FOR ELECTRON-LESS OPEN CONFIG")
    });
}

// Quit the application
export function quit() {
    withElectronAPI("quit", (electronAPI) => {
        electronAPI.quit();
    })
}

// Mark the current config's terms and conditions accepted
export function acceptTermsAndConditions() {
    withElectronAPI("acceptTermsAndConditions", (electronAPI) => {
        electronAPI.acceptTermsAndConditions();
    })
}