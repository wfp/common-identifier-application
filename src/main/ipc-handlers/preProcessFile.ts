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

import { BrowserWindow } from "electron";
import { ConfigStore } from "../algo-shared/config/configStore.js";
import { preprocessFile as backendPreProcessFile } from "../algo-shared/processing/index.js";

const MAX_ROWS_TO_PREVIEW = 500;

interface IPCFileDroppedInput {
    mainWindow: BrowserWindow,
    configStore: ConfigStore,
    filePath: string,
}

export async function preProcessFile({ mainWindow, configStore, filePath}: IPCFileDroppedInput) {

    console.log('[IPC::preProcessFile] Dropped File:', filePath);

    const config = configStore.getConfig();

    const {  isValid, isMappingDocument, data, errorFilePath, inputFilePath  } = await backendPreProcessFile({ config, inputFilePath: filePath});
    console.log("[IPC::preProcessFile] PREPROCESSING DONE");

    // if this is error data, filter to only errors first.
    if (!isValid) {
        const errors = data.sheets[0].data.filter(r => r.errors);
        console.log(`[IPC::preProcessFile] ${errors.length} validation errors found`)
        data.sheets[0].data = errors;
    }
    
    // don't return large datasets back to the frontend, instead splice and send n rows
    if (data.sheets[0].data.length > MAX_ROWS_TO_PREVIEW) {
        console.log(`[IPC::preProcessFile] input data array has ${data.sheets[0].data.length} rows, trimming for frontend preview`);
        data.sheets[0].data = data.sheets[0].data.slice(0, MAX_ROWS_TO_PREVIEW);
    }
    
    mainWindow.webContents.send('preprocessingDone', {
        isValid, isMappingDocument, data, errorFilePath, inputFilePath
    });

}