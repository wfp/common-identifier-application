
import { useAppStore } from '../store';
import ErrorWrapper from '../components/ErrorWrapper';

function InvalidConfig({config, error}) {
    const loadNewConfig = useAppStore(store => store.loadNewConfig);


    console.log("CONFIG:", config)
    // figure out if this is an error in the salt file
    const errorMessageKey = "error_in_config";

    return (<div className="error-screen InvalidConfig appScreen">
        <div className="help">
            <h3 className="titleText">Configuration error</h3>
            <ErrorWrapper config={config} error={error} messageKey={errorMessageKey} />
        </div>

        <div className="cid-button-row">
            <button className="cid-button cid-button-lg cid-button-alert" onClick={loadNewConfig}><span className="icon">⚙</span> Update the configuration from a file</button>
        </div>

        <div className="developerInformation">
            <h4>Technical Details</h4>
            <code>{error}</code>
        </div>

    </div>)
}

export default InvalidConfig;