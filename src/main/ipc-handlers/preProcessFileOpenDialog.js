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

const { dialog } = require('electron')
const preProcessFile = require('./preProcessFile');

// Shows a file open dialog and starts preprocessing the selected file
function preProcessFileOpenDialog({ mainWindow, configStore, processing}) {

    return dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: "CSV or XLSX files", extensions: ["csv", "xlsx"] },
        ],
    }).then((response) => {
        if (!response.canceled) {
            // handle fully qualified file name
            const filePath = response.filePaths[0];
            console.log("[IPC] [preProcessFileOpenDialog] Starting to process file from open dialog:", filePath);
            return preProcessFile({mainWindow, configStore, filePath, processing});
        } else {
            console.log("[IPC] [preProcessFileOpenDialog] no file selected");
            // send the cancelec message
            mainWindow.webContents.send('processingCanceled', {});
        }
    });
}

module.exports = preProcessFileOpenDialog;