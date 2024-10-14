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

// Attempts to display the for-end-users error summary
// if the config does not contain relevant messages (or the config is invalid)
// it'll fall back to a short summary
//
// messageKey is the name of the message inside the messages key in the config
function ErrorWrapper({config, error, isRuntimeError}) {

    let _messageKey = "error_in_config";

    // check the error message to see if this is a config or seed error
    if (/Invalid salt file/.test(error)) {
        _messageKey = "error_in_salt";
    }

    // if no messages present
    if (!config || !config.data || !config.data.messages || !config.data.messages[_messageKey]) {
        return (<div className="userErrorMessage userErrorMessageMissing">
            An internal error occured and the configuration is invalid.
        </div>)
    }

    //

    let userMessage = config.data.messages[_messageKey];

    // runtime errors are currently handled as special cases
    if (isRuntimeError) {
        userMessage = "Internal error in the application"
    }


    return (<div className="userErrorMessage">
            <div className="fromConfig" dangerouslySetInnerHTML={{ __html: userMessage }} />
    </div>);
}


export default ErrorWrapper;