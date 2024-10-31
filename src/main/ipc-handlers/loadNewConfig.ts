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

import { dialog } from 'electron';
import { ConfigStore } from '../algo-shared/config/configStore.js';

export async function loadNewConfig({ configStore }: { configStore: ConfigStore }) {
    console.log("[IPC] [loadNewConfig] App requested loading a new config")

    const response = await dialog.showOpenDialog({
        properties: ['openFile'],
        filters: [
            { name: "All config files", extensions: ["toml", "json"] },
            { name: "TOML files", extensions: ["toml"] },
            { name: "JSON files", extensions: ["json"] },
        ],
    });
    if (!response.canceled) {
        // handle fully qualified file name
        const filePath = response.filePaths[0];
        console.log("[IPC] [loadNewConfig] Starting to load config file from open dialog:", filePath);

        // attempt to load into the store
        const loadError = configStore.updateUserConfig(filePath);

        if (!loadError) {
            return {
                success: true,
                config: configStore.getConfig(),
                lastUpdated: configStore.lastUpdated,
            };
        }

        console.log("[IPC] [loadNewConfig] CONFIG LOAD ERROR:", loadError);
        return {
            success: false,
            canceled: false,
            error: loadError,
            config: configStore.getConfig(),
        };

    } else {
        return {
            success: false,
            canceled: true,
            config: configStore.getConfig(),
        };
    }

}