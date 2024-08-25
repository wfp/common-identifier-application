
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