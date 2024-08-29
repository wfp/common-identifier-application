
import FileInfo from "../components/FileInfo";
import SheetTabs from "../components/SheetTabs";
import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from "../store";

function ProcessingFinished({ config, outputData, outputFilePath, mappingFilePath }) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // clean the data we show to the user to only include the desired columns

    return (
        <div className="ProcessingFinished appScreen">
            <FileInfo filePath={outputFilePath} otherFilePath={mappingFilePath} helpText="Saved as" />

            <SheetTabs documentData={outputData} columnsConfig={config.data.destination.columns} />

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