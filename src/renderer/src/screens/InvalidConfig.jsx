
import { useAppStore } from '../store';

function InvalidConfig({error}) {
    const loadNewConfig = useAppStore(store => store.loadNewConfig);

    return (<div className="InvalidConfig appScreen progressIndicator">
        {/* <div className="loaderWrapper">
            <span class="loader"></span>
        </div> */}
        <div className="help">
            Configuration error
            <pre>{error}</pre>
        </div>
        <div className="updateConfig backToMain">
            {/* Update the configuration File */}
            <button onClick={loadNewConfig} className="openConfigFile bigButton"><span class="icon">⚙</span> Update the configuration from a file</button>
        </div>

    </div>)
}

export default InvalidConfig;