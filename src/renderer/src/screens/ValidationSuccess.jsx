import BottomButtons from "../components/BottomButtons";
import FileInfo from "../components/FileInfo";
import PreviewTable from "../components/PreviewTable";
import { useAppStore } from "../store";
import { filterColumnConfigForMapping } from "../util";

function ValidationSuccess({config, inputData, inputFilePath, isMappingDocument}) {
    const preProcessFileOpenDialog = useAppStore(store => store.preProcessFileOpenDialog);
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
        <div className="ValidationSuccess">
            <FileInfo filePath={inputFilePath} helpText="Ready to process the file" />

            <PreviewTable tableData={inputData.sheets[0].data} columnsConfig={columnsConfig}/>

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

            <BottomButtons l_content="Open a different file" l_onClick={preProcessFileOpenDialog} r_onClick={processTheFile} r_content="Process the file" />

        </div>
    )
}

export default ValidationSuccess;