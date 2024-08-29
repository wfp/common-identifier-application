import FileInfo from "../components/FileInfo";
import OpenFileRegion from "../components/OpenFileRegion";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";

function ValidationSuccess({config, inputData, inputFilePath}) {

    const startProcessingFile = useAppStore(store => store.startProcessingFile);

    function processTheFile(e) {
        startProcessingFile(inputFilePath, "/tmp")
    }

    return (
        <div className="ValidationSuccess appScreen">
            <FileInfo filePath={inputFilePath} helpText="ready to process the file" />

            <SheetTabs documentData={inputData} columnsConfig={config.data.source.columns}/>

            <div className="validationResult ok">
                <div className="validationState">
                    File is Valid
                </div>
            </div>

            <div className="buttonRow buttonRow2">
                <OpenFileRegion label="Open a different file" />

                <div className="processButton">
                    <button className="bigButton" onClick={processTheFile}>Process the file</button>
                </div>
            </div>

        </div>
    )
}

export default ValidationSuccess;