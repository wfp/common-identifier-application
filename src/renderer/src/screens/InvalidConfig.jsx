
import { useAppStore } from '../store';

function InvalidConfig({error}) {
    const loadNewConfig = useAppStore(store => store.loadNewConfig);

    return (<div className="InvalidConfig appScreen progressIndicator">
        <div className="help">
            Configuration error
            <pre>{error}</pre>
        </div>
        <div className="updateConfig backToMain">
            <button onClick={loadNewConfig} className="openConfigFile bigButton"><span class="icon">⚙</span> Update the configuration from a file</button>
        </div>

    </div>)
}

export default InvalidConfig;