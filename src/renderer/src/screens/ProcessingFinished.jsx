
import FileInfo from "../components/FileInfo";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";

function ProcessingFinished({ outputData, outputFilePath }) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    return (
        <div className="ProcessingFinished appScreen">
            <FileInfo filePath={outputFilePath} helpText="Saved as" />

            <SheetTabs inputData={outputData} />

            <div className="doneButton">
                <button className="bigButton" onClick={backToMainScreen}>Done</button>
            </div>
        </div>
    )
}

export default ProcessingFinished;