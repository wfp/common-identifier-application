import { useAppStore } from '../store';
import ErrorWrapper from '../components/ErrorWrapper';

function Error({config, isRuntimeError, error}) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";


    return (<div className="error-screen">
        <div className="help">
            <h3 className="titleText">ERROR</h3>
            <ErrorWrapper config={config} error={error} isRuntimeError={isRuntimeError} messageKey={errorMessageKey} />
        </div>

        <div className="cid-button-row">
            <button className="cid-button cid-button-lg cid-button-alert" onClick={backToMainScreen}>Back to the main screen</button>
        </div>

        <div className="developerInformation">
            <h4>Technical Details</h4>
            <code>{error}</code>
        </div>

    </div>)
}

export default Error;