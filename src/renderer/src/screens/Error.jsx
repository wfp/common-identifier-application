import { useAppStore } from '../store';


function ConfigSignature({config}) {
    if (config && config.data && config.data.signature && config.data.signature.config_signature) {
        return (<div className="configSignature">
            Active config file signature:
            <pre className="singatureCode">{config.data.signature.config_signature }</pre>
        </div>);
    }

    return (<></>);
}


// Attempts to display the for-end-users error summary
// if the config does not contain relevant messages (or the config is invalid)
// it'll fall back to a short summary
//
// messageKey is the name of the message inside the messages key in the config
function ErrorWrapper({config, messageKey}) {

    if (!config || !config.data || !config.data.messages || !config.data.messages[messageKey]) {
        return (<div className="userErrorMessage userErrorMessageMissing">
            An internal error occured and the configuration is invalid.
        </div>)
    }

    const userMessage = config.data.messages[messageKey];

    return (<div className="userErrorMessage">
            <div className="fromConfig" dangerouslySetInnerHTML={{ __html: userMessage }} />
    </div>);
}



function Error({config, error}) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";

    return (<div className="Error appScreen progressIndicator">
        <div className="help">
            <h2>ERROR</h2>
            <ErrorWrapper config={config} messageKey={errorMessageKey} />
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