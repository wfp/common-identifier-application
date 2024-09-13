
const os = require('node:os');
const fs = require('node:fs');
const path = require('node:path');

const ALGO_NAME = "algo-gos"
const ALGO_PATH = path.join(__dirname, "..", "src", "main", ALGO_NAME);
const CONFIG_FILE_PATH = path.join(ALGO_PATH, 'config', 'config.backup.toml');

const {loadConfig} = require("../src/main/algo-shared/config/loadConfig");
const processing = require(`../src/main/algo-shared/processing`);

function compareFilesAndStopIfNotMatching(pathA, pathB) {
    console.log("Comparing ", pathA);
    console.log("       to ", pathB);
    const contentsA = fs.readFileSync(pathA, "utf-8");
    const contentsB = fs.readFileSync(pathB, "utf-8");

    const filesMatch = (contentsA == contentsB);
    if (!filesMatch) {
        console.log("==> FILES DO NOT MATCH")
        // exit with error code
        process.exit(-1)
    } else {
        console.log("==> FILES MATCH")
    }
}


(async () => {


    const configLoad = loadConfig(CONFIG_FILE_PATH);
    const config = configLoad.config;

    const inputFilePath = path.join(ALGO_PATH, "testdata", "input_data.csv")
    const outputTestFilePath = path.join(ALGO_PATH, "testdata", "output_data.csv")
    const outputTestMappingFilePath = path.join(ALGO_PATH, "testdata", "output_mapping_data.csv")
    const outputBasePath = path.join(os.tmpdir(), "algo-test");


    const {mappingFilePaths, outputFilePaths } = await processing.processFile(config, outputBasePath, inputFilePath, undefined, '.csv')

    console.log("PROCESSING DONE", {mappingFilePaths, outputFilePaths})

    compareFilesAndStopIfNotMatching(outputFilePaths[0], outputTestFilePath);
    compareFilesAndStopIfNotMatching(mappingFilePaths[0], outputTestMappingFilePath);


    // mainWindow.webContents.send('processingDone', {
    //     outputData,
    //     outputFilePaths,
    //     mappingFilePaths,
    // })

})()