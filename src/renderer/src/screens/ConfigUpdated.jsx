
import { useAppStore } from "../store";

function ConfigUpdated({config}) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    const {meta} = config.data;

    return (
        <div className="ConfigUpdated appScreen">
            <h2>
                Configuration successfully updated to
                <span className="version">{meta.version}-{meta.region}</span>
            </h2>

            <div className="doneButton">
                <button className="bigButton" onClick={backToMainScreen}>Done</button>
            </div>
        </div>
    )
}

export default ConfigUpdated;