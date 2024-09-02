
import { useAppStore } from "../store";

function ConfigUpdated({config}) {

    const showTermsAndConditions = useAppStore(store => store.showTermsAndConditions);

    const {meta} = config.data;

    return (
        <div className="ConfigUpdated appScreen">
            <h2>
                Configuration successfully updated to
                <span className="version">{meta.version}-{meta.region}</span>
            </h2>

            <div className="doneButton">
                <button className="bigButton" onClick={showTermsAndConditions}>Done</button>
            </div>
        </div>
    )
}

export default ConfigUpdated;