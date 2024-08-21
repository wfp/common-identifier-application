
import FileInfo from "../components/FileInfo";
import SheetTabs from "../components/SheetTabs";
import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from "../store";

function ProcessingFinished({ outputData, outputFilePath, mappingFilePath }) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    return (
        <div className="ProcessingFinished appScreen">
            <FileInfo filePath={outputFilePath} otherFilePath={mappingFilePath} helpText="Saved as" />

            <SheetTabs inputData={outputData} />

            <div className="buttonRow buttonRow2">
                <OpenFileRegion label="Process Another file" />

                <div className="doneButton">
                    <button className="bigButton" onClick={backToMainScreen}>Done</button>
                </div>
            </div>
        </div>
    )
}

export default ProcessingFinished;