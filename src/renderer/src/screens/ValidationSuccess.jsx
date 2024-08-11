import FileInfo from "../components/FileInfo";
import OpenFileRegion from "../components/OpenFileRegion";
import VersionInfo from "../components/VersionInfo";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";

function ValidationSuccess({inputData, inputFilePath}) {

    const startProcessingFile = useAppStore(store => store.startProcessingFile);

    function processTheFile(e) {
        startProcessingFile(inputFilePath, "/tmp")
    }

    return (
        <div className="ValidationSuccess appScreen">
            <FileInfo filePath={inputFilePath} helpText="ready to process the file" />

            <SheetTabs inputData={inputData}/>

            <div className="validationResult ok">
                <div className="validationState">
                    File is Valid
                </div>
            </div>
            <div className="processButton">
                <button className="bigButton" onClick={processTheFile}>Process the file</button>
            </div>

            <OpenFileRegion label="Open a different file" />

        </div>
    )
}

export default ValidationSuccess;