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

import { ConfigStore } from "../algo-shared/config/configStore.js";

// Removes the user configuration and falls back to the built-in default
export function removeUserConfig({configStore}: { configStore: ConfigStore}) {

    console.log("[IPC] [removeUserConfig] start")

    const loadError = configStore.removeUserConfig();

    console.log("[IPC] [removeUserConfig] result:", loadError);

    //
    if (!loadError) {
        return {
            success: true,
            config: configStore.getConfig(),
            lastUpdated: configStore.lastUpdated,
        };
    }

    return {
        success: false,
        // canceled: false,
        error: loadError,
        // config: configStore.getConfig(),
    }


}
