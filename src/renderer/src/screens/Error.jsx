import { useAppStore } from '../store';

function Error({error}) {
    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    return (<div className="Error appScreen progressIndicator">
        <div className="help">
            ERROR
            <pre>{error}</pre>
        </div>
        <div className="backToMain">
            <button className="errorBackButton bigButton" onClick={backToMainScreen}>Back to the main screen</button>
        </div>
    </div>)
}

export default Error;