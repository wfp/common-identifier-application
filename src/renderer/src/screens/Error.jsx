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


function Error({config, error}) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";

    const isSaltFileError = /Invalid salt/

    return (<div className="Error appScreen progressIndicator">
        <div className="help">
            <h2>ERROR</h2>
            <ErrorWrapper config={config} error={error} messageKey={errorMessageKey} />
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