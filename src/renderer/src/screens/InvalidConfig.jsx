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

import { useAppStore } from '../store';
import ErrorWrapper from '../components/ErrorWrapper';

function InvalidConfig({config, error}) {
    const loadNewConfig = useAppStore(store => store.loadNewConfig);


    console.log("CONFIG:", config)
    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";

    return (<div className="Error InvalidConfig appScreen">
        <div className="help">
            <h2>Configuration error</h2>
            <ErrorWrapper config={config} error={error} messageKey={errorMessageKey} />
        </div>

        <div className="buttonRow buttonRow1">
            <div className="updateConfig backToMain">
                <button onClick={loadNewConfig} className="openConfigFile bigButton"><span class="icon">⚙</span> Update the configuration from a file</button>
            </div>
        </div>

        <div className="developerInformation">
            <h4>Technical details</h4>
            <div className="errorMessage">
                <code>{error}</code>
            </div>
        </div>

    </div>)
}

export default InvalidConfig;