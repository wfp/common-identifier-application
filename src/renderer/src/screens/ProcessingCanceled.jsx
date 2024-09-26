import { useAppStore } from "../store";

function ProcessingCanceled() {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);


    return (
        <div className="ProcessingCancelled appScreen">
            <h2>
                Processing cancelled
            </h2>

            <div className="doneButton">
                <button className="bigButton" onClick={backToMainScreen}>Done</button>
            </div>
        </div>
    )
}

export default ProcessingCanceled;