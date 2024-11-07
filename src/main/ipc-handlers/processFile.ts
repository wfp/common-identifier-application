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

import path from 'node:path';
import { BrowserWindow, dialog } from 'electron';
import { baseFileName } from '../util.js';
import { ConfigStore } from '../algo-shared/config/configStore.js';
import { processFile as backendProcessFile } from '../algo-shared/processing/index.js';
import { SUPPORTED_FILE_TYPES } from '../algo-shared/document.js';
import { makeHasher } from '../active_algorithm.js';

const MAX_ROWS_TO_PREVIEW = 500;

interface IPCProcessFileInput {
    mainWindow: BrowserWindow;
    configStore: ConfigStore;
    filePath: string;
}

// The actual processing function called after the output path is selected
async function doProcessFile(
    mainWindow: BrowserWindow,
    configStore: ConfigStore,
    inputFilePath: string,
    outputPath: string,
)  {
    const config = configStore.getConfig();
    let outputFormat = undefined;
    let outputBasePath = outputPath;
    // figure out the output path
    const extension = path.extname(outputPath);
    // we may need to use the extension-less output path (if we replace the extension)
    const basePath = path.join(path.dirname(outputPath), path.basename(outputPath, path.extname(outputPath)));

    switch (extension.toLowerCase()) {
        case ".xlsx":
            outputFormat = SUPPORTED_FILE_TYPES.XLSX;
            outputBasePath = basePath;
            break;
        case ".csv":
            outputFormat = SUPPORTED_FILE_TYPES.CSV;
            outputBasePath = basePath;
            break;
        default:
            outputFormat = undefined;
            outputBasePath = basePath;
            break;
    }

    const { outputData, allOutputPaths } = await backendProcessFile({config, outputPath: outputBasePath, inputFilePath, hasherFactory: makeHasher, format: outputFormat})
    console.log("[IPC::processFile] PROCESSING DONE");
    if (outputData.sheets[0].data.length > MAX_ROWS_TO_PREVIEW) {
        console.log(`[IPC::preProcessFile] dataset has ${outputData.sheets[0].data.length} rows, trimming for frontend preview`);
        outputData.sheets[0].data = outputData.sheets[0].data.slice(0, MAX_ROWS_TO_PREVIEW);
    }
    mainWindow.webContents.send('processingDone', { outputData, allOutputPaths });
}




// Process a file
export async function processFile({mainWindow, configStore, filePath}: IPCProcessFileInput) {

    console.log('=========== Processing File:', filePath);

    const response = await dialog.showSaveDialog({
        defaultPath: baseFileName(filePath),
    });
    if (response.canceled || response.filePath === '') {
        console.log("[IPC::processFile] no file selected");
        // send the canceled message
        mainWindow.webContents.send('processingCanceled', {});
        return;
    }
    const outputPath = response.filePath;
    console.log("[IPC::processFile] STARTING TO PROCESS AS", outputPath);
    return doProcessFile(mainWindow, configStore, filePath, outputPath);
}