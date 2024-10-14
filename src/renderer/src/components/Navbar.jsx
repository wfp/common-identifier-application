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

import { SCREEN_FILE_LOADING, SCREEN_MAIN, SCREEN_ERROR, SCREEN_CONFIG_UPDATED, useAppStore, SCREEN_LOAD_NEW_CONFIG, SCREEN_PROCESSING_CANCELED } from "../store";
import VersionInfo from "./VersionInfo";

// returns a navbar based on the name of the screen
function Navbar({ config, screenType }) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    console.log({ screenType })

    let backButton;

    switch (screenType) {
        // Some screens dont need the back button
        case SCREEN_ERROR:
        case SCREEN_PROCESSING_CANCELED:
        case SCREEN_LOAD_NEW_CONFIG:
        case SCREEN_FILE_LOADING:
        case SCREEN_CONFIG_UPDATED:
        case SCREEN_MAIN:
            backButton = (<></>);
            break;
        default:
            backButton = (<a href="#" onClick={backToMainScreen}>&larr; Back to the main screen</a>);
    }

    // if we're on the initial configuration (meaning we don't have a valid config or salt)
    // don't show the back button
    if (config.isInitial) {
        backButton = (<></>);
    }

    return (
        <div className="main-navigation">
            <div className="back-button">
                {backButton}
            </div>

            <VersionInfo config={config} />
        </div>
    )
}

export default Navbar;