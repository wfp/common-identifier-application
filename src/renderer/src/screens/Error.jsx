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

function ConfigSignature({config}) {
    if (config && config.data && config.data.signature && config.data.signature.config_signature) {
        return (<div className="configSignature">
            Active config file signature:
            <pre className="singatureCode">{config.data.signature.config_signature }</pre>
        </div>);
    }

    return (<></>);
}


function Error({config, isRuntimeError, error}) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";


    return (<div className="Error appScreen progressIndicator">
        <div className="help">
            <h2>ERROR</h2>
            <ErrorWrapper config={config} error={error} isRuntimeError={isRuntimeError} messageKey={errorMessageKey} />
        </div>

        <div className="buttonRow buttonRow1">
            <div className="backToMain">
                <button className="errorBackButton bigButton" onClick={backToMainScreen}>Back to the main screen</button>
            </div>
        </div>

        <div className="developerInformation">
            <h4>Technical details</h4>
            <div className="errorMessage">
                <code>{error}</code>
            </div>
            {/* <ConfigSignature config={config} /> */}
        </div>

    </div>)
}

export default Error;