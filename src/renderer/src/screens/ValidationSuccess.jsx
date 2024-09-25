import FileInfo from "../components/FileInfo";
import OpenFileRegion from "../components/OpenFileRegion";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";
import { filterColumnConfigForMapping } from "../util";

function ValidationSuccess({config, inputData, inputFilePath, isMappingDocument}) {

    const startProcessingFile = useAppStore(store => store.startProcessingFile);

    function processTheFile(e) {
        startProcessingFile(inputFilePath, "/tmp")
    }

    // The schema for displaying the table
    let columnsConfig = config.data.source.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
        columnsConfig = filterColumnConfigForMapping(config.data, columnsConfig);
    }

    return (
        <div className="ValidationSuccess appScreen">
            <FileInfo filePath={inputFilePath} helpText="Ready to process the file" />

            <SheetTabs documentData={inputData} columnsConfig={columnsConfig}/>

            <div className="validationResult ok">
                <div className="validationState">
                    Validation finished. No errors encountered.
                    <div className="help">
                        { 
                            isMappingDocument
                                ? "Valid mapping file."
                                : "Valid intended assistance file."
                        }
                    </div>
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