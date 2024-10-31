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
import { preprocessFile as backendPreProcessFile, PreprocessFileResult } from "../algo-shared/processing/index.js";

interface IPCFileDroppedInput {
    mainWindow: BrowserWindow,
    configStore: ConfigStore,
    filePath: string,
}

export async function preProcessFile({ mainWindow, configStore, filePath}: IPCFileDroppedInput) {

    console.log('[IPC] [fileDropped] Dropped File:', filePath);

    const config = configStore.getConfig();
    const limit = undefined;

    const result_1 = await backendPreProcessFile(config, filePath, limit);
    console.log("[IPC] [fileDropped] PREPROCESSING DONE");
    mainWindow.webContents.send('preprocessingDone', Object.assign({
        inputFilePath: filePath,
    }, result_1)
    );

}