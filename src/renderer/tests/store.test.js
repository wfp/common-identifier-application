import {
    storeLogic,
    SCREEN_BOOT,
    SCREEN_WELCOME,
    SCREEN_MAIN,
    SCREEN_FILE_LOADING,

    SCREEN_VALIDATION_SUCCESS,
    SCREEN_VALIDATION_FAILED,

    SCREEN_PROCESSING_IN_PROGRESS,
    SCREEN_PROCESSING_FINISHED,
    SCREEN_PROCESSING_CANCELED,

    SCREEN_LOAD_NEW_CONFIG,
    SCREEN_CONFIG_UPDATED,
    SCREEN_ERROR,
    SCREEN_INVALID_CONFIG,
    SCREEN_CONFIG_CHANGE,

} from '../src/store.logic'


class TestIntercomApi {
    constructor() {
        this.calls = [];
        [
            "acceptTermsAndConditions",
            "loadNewConfig",
            "openOutputFile",
            "preProcessFileOpenDialog",
            "quit",
            "removeUserConfig",
            "startPreProcessingFile",
            "startProcessingFile",
        ].forEach(method => {
            this[method] = (...args) => this.calls.push([method].concat(args))
        })
    }
}

class StoreTestRunner {
    constructor(initialState={}) {
        this.lastSetValue = initialState;
        this.intercomApi = new TestIntercomApi();
    }

    getLastSetValue() { return this.lastSetValue; }
    setLastSetValue(delegate) { return this.lastSetValue = delegate( this.lastSetValue); }

}


function runStoreTest(initialState) {
    const runner = new StoreTestRunner(initialState);
    const store = storeLogic(runner.intercomApi)(v => runner.setLastSetValue(v));

    return { store, runner }
}

function testStoreCall(initial, delegate) {
    const {store, runner } = runStoreTest(initial);
    delegate(store)
    return runner.getLastSetValue()
}

const TEST_CFG_OK = { a:"A", b: "B" }
const TEST_ERROR = "SOME ERROR";
const TEST_PATH = "SOME PATH"
const TEST_PATH_B = "OTHER PATH";

const TEST_DOCUMENT_DATA_A = { sheets: [ { name: "SHEET_1", data: [{col_a:"A"}]}] }
const TEST_DOCUMENT_DATA_B = { sheets: [ { name: "SHEET_1", data: [{col_b:"B"}]}] }
const TEST_VALIDATION_RESULT_OK = [{ ok: true }]
const TEST_VALIDATION_RESULT_ERROR = [{ok: true}, { ok: false }]
// BOOT
////////////////////////////////////////////////////////////////////////////////


test("Clean boot", () => {
    const {store, runner } = runStoreTest()

    expect(store.screen).toEqual(SCREEN_BOOT)
    store.boot({
        config: TEST_CFG_OK,
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
    })
    const lv = runner.getLastSetValue();
    expect(runner.getLastSetValue().screen).toEqual(SCREEN_MAIN)
    expect(lv.config.isBackup).toEqual(false)
    expect(lv.config.data).toEqual(TEST_CFG_OK)
})

test("TOC boot", () => {
    const {store, runner } = runStoreTest()

    expect(store.screen).toEqual(SCREEN_BOOT)
    store.boot({
        config: TEST_CFG_OK,
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: false,
    })
    const lv = runner.getLastSetValue();
    expect(runner.getLastSetValue().screen).toEqual(SCREEN_WELCOME)
    expect(lv.config.isBackup).toEqual(false)
    expect(lv.config.data).toEqual(TEST_CFG_OK)
})

test("Backup boot", () => {
    const {store, runner } = runStoreTest()

    store.boot({
        config: TEST_CFG_OK,
        lastUpdated: new Date(),
        isBackup: true,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
    })
    const lv = runner.getLastSetValue();
    expect(lv.screen).toEqual(SCREEN_MAIN)
    expect(lv.config.isBackup).toEqual(true)
    expect(lv.config.data).toEqual(TEST_CFG_OK)
})

test("Error boot", () => {
    const {store, runner } = runStoreTest()
    store.boot({
        config: TEST_CFG_OK,
        lastUpdated: new Date(),
        isBackup: true,
        error: TEST_ERROR,
        hasAcceptedTermsAndConditions: true,
    })
    const lv = runner.getLastSetValue();
    expect(lv.screen).toEqual(SCREEN_INVALID_CONFIG)
    expect(lv.config.data).toEqual(TEST_CFG_OK)
    expect(lv.config.isInitial).toEqual(true)
    expect(lv.errorMessage).toMatch(TEST_ERROR)
})


// BACK TO MAIN & OTHER QUICKNAV
////////////////////////////////////////////////////////////////////////////////


test("Back to main", () => {
    [SCREEN_MAIN,
        SCREEN_PROCESSING_CANCELED,
        SCREEN_VALIDATION_FAILED,
        SCREEN_PROCESSING_FINISHED
    ].forEach(screen => {
        const {store, runner } = runStoreTest({ screen });
        store.backToMainScreen()
        expect(runner.getLastSetValue().screen).toEqual(SCREEN_MAIN);
    })
})




test("showTermsAndConditions", () => {
    [
        SCREEN_LOAD_NEW_CONFIG,
        SCREEN_CONFIG_UPDATED,
    ].forEach(screen => {
        const {store, runner } = runStoreTest({ screen });
        store.showTermsAndConditions()
        expect(runner.getLastSetValue().screen).toEqual(SCREEN_WELCOME);
    })
})

test("startConfigChange", () => {
    const result = testStoreCall( TEST_STATE, store => store.startConfigChange());
    expect(result.screen).toEqual(SCREEN_CONFIG_CHANGE)
    expect(result.config).toEqual(TEST_STATE.config)
})


test("processingCanceled", () => {

    const result = testStoreCall( TEST_STATE, store => store.processingCanceled());

    expect(result.screen).toEqual(SCREEN_PROCESSING_CANCELED)
    expect(result.config).toEqual(TEST_STATE.config)
})

// ERROR REPORTING
////////////////////////////////////////////////////////////////////////////////


test("Error reporting", () => {
    const result = testStoreCall({
        screen: SCREEN_PROCESSING_IN_PROGRESS,
        config: { data: TEST_CFG_OK }
    }, store => store.reportError(TEST_ERROR));

    expect(result.screen).toEqual(SCREEN_ERROR);
    expect(result.isRuntimeError).toEqual(true);
    expect(result.errorMessage).toMatch(TEST_ERROR);
    expect(result.config.data).toEqual(TEST_CFG_OK);

})


// INTERCOM BASICS
////////////////////////////////////////////////////////////////////////////////

const TEST_STATE = {
    screen: SCREEN_MAIN,
    config: { data: TEST_CFG_OK, lastUpdated: new Date()}
}

test("Intercom quit", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.quit()

    expect(runner.intercomApi.calls).toEqual([["quit"]])
})

test("Intercom openOutputFile", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.openOutputFile(TEST_PATH)
    expect(runner.intercomApi.calls).toEqual([["openOutputFile", TEST_PATH]])
})

test("Intercom acceptTermsAndConditions", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.acceptTermsAndConditions()
    expect(runner.intercomApi.calls).toEqual([["acceptTermsAndConditions"]])

    const lv = runner.getLastSetValue();
    expect(lv.screen).toEqual(SCREEN_MAIN)
    expect(lv.config).toEqual(TEST_STATE.config)
})

// INTERCOM CONFIG
////////////////////////////////////////////////////////////////////////////////

const TEST_NEW_CONFIG = { a: "A" }

test("Intercom removeUserConfig", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.removeUserConfig()
    expect(runner.intercomApi.calls).toEqual([["removeUserConfig"]])

    const lv = runner.getLastSetValue()
    expect(lv.screen).toEqual(SCREEN_LOAD_NEW_CONFIG)
    expect(lv.config).toEqual(TEST_STATE.config)
})

test("Intercom userConfigRemoved success", () => {
    const now = new Date();
    const result = testStoreCall(
        TEST_STATE,
        store => store.userConfigRemoved({ success: true, config: TEST_NEW_CONFIG, lastUpdated: now })
    );

    expect(result.screen).toEqual(SCREEN_CONFIG_UPDATED);
    expect(result.config.data).toEqual(TEST_NEW_CONFIG);
    expect(result.config.lastUpdated).toEqual(now);
})


test("Intercom userConfigRemoved error", () => {
    const now = new Date();
    const result = testStoreCall(
        TEST_STATE,
        store => store.userConfigRemoved({ success: false, error: TEST_ERROR})
    );

    expect(result.screen).toEqual(SCREEN_ERROR);
    expect(result.isRuntimeError).toEqual(false);
    expect(result.errorMessage).toMatch(TEST_ERROR);
    expect(result.errorMessage).toMatch(/Backup/i);
    expect(result.config.data).toEqual(TEST_CFG_OK);
})

test("Intercom loadNewConfig", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.loadNewConfig()
    expect(runner.intercomApi.calls).toEqual([["loadNewConfig"]])
    expect(runner.getLastSetValue().screen).toEqual(SCREEN_LOAD_NEW_CONFIG)
})

test("Intercom loadNewConfigDone OK", () => {
    const now = new Date();
    const result = testStoreCall(
        TEST_STATE,
        store => store.loadNewConfigDone({
            success: true,
            // canceled,
            // error,
            config: TEST_NEW_CONFIG,
            lastUpdated: now,
        })
    )

    expect(result.screen).toEqual(SCREEN_CONFIG_UPDATED)
    expect(result.config.data).toEqual(TEST_NEW_CONFIG)
    expect(result.config.lastUpdated).toEqual(now)
    expect(result.config.isBackup).toEqual(false)
})

test("Intercom loadNewConfigDone Canceled but have config", () => {
    const now = new Date();
    const result = testStoreCall(
        TEST_STATE,
        store => store.loadNewConfigDone({
            canceled: true,
        })
    )

    expect(result.screen).toEqual(SCREEN_MAIN)
    expect(result.config).toEqual(TEST_STATE.config)
})


test("Intercom loadNewConfigDone Canceled and there is no config", () => {
    const now = new Date();
    const result = testStoreCall(
        {
            screen: SCREEN_BOOT,
            errorMessage: TEST_ERROR,
            config: { isInitial: true, data: {} }
        },
        store => store.loadNewConfigDone({
            canceled: true,
        })
    )

    expect(result.screen).toEqual(SCREEN_INVALID_CONFIG)
    expect(result.errorMessage).toMatch(TEST_ERROR)
    expect(result.config.isInitial).toEqual(true)
})

test("Intercom loadNewConfigDone error but there is already a config", () => {
    const now = new Date();
    const result = testStoreCall(
        TEST_STATE,
        store => store.loadNewConfigDone({
            error: TEST_ERROR,
        })
    )

    expect(result.screen).toEqual(SCREEN_ERROR)
    expect(result.isRuntimeError).toEqual(false)
    expect(result.config).toEqual(TEST_STATE.config)
    expect(result.errorMessage).toMatch(TEST_ERROR)
})

test("Intercom loadNewConfigDone error and there is no existing config", () => {
    const now = new Date();
    const result = testStoreCall(
        {
            screen: SCREEN_BOOT,
            errorMessage: TEST_ERROR,
            config: { isInitial: true, data: {} }
        },
        store => store.loadNewConfigDone({
            error: TEST_ERROR,
        })
    )

    expect(result.screen).toEqual(SCREEN_INVALID_CONFIG)
    expect(result.errorMessage).toMatch(TEST_ERROR)
})



test("updateConfig", () => {
    const IS_BACKUP = false;
    const result = testStoreCall(TEST_STATE, store => store.updateConfig(TEST_NEW_CONFIG, IS_BACKUP))

    expect(result.screen).toEqual(TEST_STATE.screen)
    expect(result.config.data).toEqual(TEST_NEW_CONFIG)
    expect(result.config.isBackup).toEqual(IS_BACKUP)
})

// INTERCOM PREPROCESS
////////////////////////////////////////////////////////////////////////////////



test("Intercom preProcessFileOpenDialog", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.preProcessFileOpenDialog()
    expect(runner.intercomApi.calls).toEqual([["preProcessFileOpenDialog"]])

    const lv = runner.getLastSetValue()
    expect(lv.screen).toEqual(SCREEN_FILE_LOADING)
    expect(lv.config).toEqual(TEST_STATE.config)
    expect(lv.inputFilePath).toEqual("")
})

test("Intercom startPreProcessingFile", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.startPreProcessingFile(TEST_PATH)
    expect(runner.intercomApi.calls).toEqual([["startPreProcessingFile", TEST_PATH]])

    const lv = runner.getLastSetValue()
    expect(lv.screen).toEqual(SCREEN_FILE_LOADING)
    expect(lv.config).toEqual(TEST_STATE.config)
    expect(lv.inputFilePath).toEqual(TEST_PATH)
})


test("Intercom preProcessingDone OK", () => {

    const result = testStoreCall(
        TEST_STATE,
        store => store.preProcessingDone({
            inputFilePath: TEST_PATH,
            inputData: TEST_DOCUMENT_DATA_A,

            validationResult: TEST_VALIDATION_RESULT_OK,
            validationErrorsOutputFile: "ERROR PATH",
            validationResultDocument: TEST_DOCUMENT_DATA_B,

            isMappingDocument: false,
        })
    )

    expect(result.screen).toEqual(SCREEN_VALIDATION_SUCCESS);
    expect(result.config).toEqual(TEST_STATE.config);
    expect(result.inputData).toEqual(TEST_DOCUMENT_DATA_A);
    expect(result.inputFilePath).toEqual(TEST_PATH);
    expect(result.isMappingDocument).toEqual(false)

})

test("Intercom preProcessingDone ERROR", () => {

    const result = testStoreCall(
        TEST_STATE,
        store => store.preProcessingDone({
            inputFilePath: TEST_PATH_B,
            inputData: TEST_DOCUMENT_DATA_A,

            validationResult: TEST_VALIDATION_RESULT_ERROR,
            validationErrorsOutputFile: TEST_PATH,
            validationResultDocument: TEST_DOCUMENT_DATA_B,

            isMappingDocument: true,
        })
    )

    expect(result.screen).toEqual(SCREEN_VALIDATION_FAILED);
    expect(result.config).toEqual(TEST_STATE.config);

    expect(result.inputData).toEqual(TEST_DOCUMENT_DATA_A);
    expect(result.inputFilePath).toEqual(TEST_PATH_B);
    expect(result.validationResult).toEqual(TEST_VALIDATION_RESULT_ERROR);
    expect(result.validationResultDocument).toEqual(TEST_DOCUMENT_DATA_B);
    expect(result.validationErrorsOutputFile).toEqual(TEST_PATH);

    expect(result.isMappingDocument).toEqual(true)

})

// INTERCOM PROCESS
////////////////////////////////////////////////////////////////////////////////


test("Intercom startProcessingFile", () => {
    const {store, runner } = runStoreTest(TEST_STATE);
    store.startProcessingFile(TEST_PATH, TEST_PATH_B)
    expect(runner.intercomApi.calls).toEqual([["startProcessingFile", TEST_PATH, TEST_PATH_B]])

    const lv = runner.getLastSetValue()
    expect(lv.screen).toEqual(SCREEN_PROCESSING_IN_PROGRESS)
    expect(lv.config).toEqual(TEST_STATE.config)
    expect(lv.inputFilePath).toEqual(TEST_PATH)
})

test("Intercom processingDone", () => {

    const result = testStoreCall(
        TEST_STATE,
        store => store.processingDone({
            outputFilePaths:[ TEST_PATH ],
            outputData: TEST_DOCUMENT_DATA_A,
            mappingFilePaths: [ TEST_PATH_B ],
            allOutputPaths:[ TEST_PATH, TEST_PATH_B],
        })
    )

    expect(result.screen).toEqual(SCREEN_PROCESSING_FINISHED);
    expect(result.config).toEqual(TEST_STATE.config);
    expect(result.outputData).toEqual(TEST_DOCUMENT_DATA_A);
    expect(result.outputFilePaths).toEqual([TEST_PATH, TEST_PATH_B]);
})
