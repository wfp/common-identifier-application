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

function fileDropped({mainWindow, configStore, filePath, processing}) {

    console.log('[IPC] [fileDropped] Dropped File:', filePath);

    const config = configStore.getConfig();
    const limit = undefined;

    return processing.preprocessFile(config, filePath, limit).then((result) => {
        console.log("[IPC] [fileDropped] PREPROCESSING DONE")
        mainWindow.webContents.send('preprocessingDone', Object.assign({
            inputFilePath: filePath,
        }, result)
        )
    });

}


module.exports = fileDropped;