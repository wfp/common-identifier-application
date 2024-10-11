
import { useAppStore } from "../store";

function ConfigUpdated({config}) {

    const showTermsAndConditions = useAppStore(store => store.showTermsAndConditions);

    const {meta} = config.data;

    return (
        <div className="config-change config-updated">
            <h3 className="titleText">Configuration Updated</h3>
            <h2>
                Configuration successfully updated to
                <span className="version">{meta.version}-{meta.region}</span>
            </h2>

            <div className="cid-button-row">
                <button className="cid-button cid-button-lg cid-button-primary" onClick={showTermsAndConditions}>Done</button>
            </div>
        </div>
    )
}

export default ConfigUpdated;