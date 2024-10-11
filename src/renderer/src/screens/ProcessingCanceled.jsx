import { useAppStore } from "../store";

function ProcessingCanceled() {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);


    return (
        <div className="ProcessingCancelled">
            <h2 className="titleText">
                Processing cancelled
            </h2>
            <div className="cid-button-row">
            <button className="cid-button cid-button-lg cid-button-primary" onClick={backToMainScreen}>Done</button>
            </div>
        </div>
    )
}

export default ProcessingCanceled;