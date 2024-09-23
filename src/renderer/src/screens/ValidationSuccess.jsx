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

    // The file valid message differs between mapping & assistance documents
    const fileIsValidMessage = isMappingDocument ?
        "File is a valid Mapping Document" :
        "File is a valid Assistance Document"


    // The schema for displaying the table
    let columnsConfig = config.data.source.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
        columnsConfig = filterColumnConfigForMapping(config.data, columnsConfig);
    }

    return (
        <div className="ValidationSuccess appScreen">
            <FileInfo filePath={inputFilePath} helpText="ready to process the file" />

            <SheetTabs documentData={inputData} columnsConfig={columnsConfig}/>

            <div className="validationResult ok">
                <div className="validationState">
                    {fileIsValidMessage}
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