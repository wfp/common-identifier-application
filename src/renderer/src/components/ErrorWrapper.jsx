
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
            <div className="textFromConfig" dangerouslySetInnerHTML={{ __html: userMessage }} />
    </div>);
}


export default ErrorWrapper;