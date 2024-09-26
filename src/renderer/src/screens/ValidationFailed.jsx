
import FileInfo from "../components/FileInfo";
import OpenFileRegion from "../components/OpenFileRegion";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";
import { filterColumnConfigForMapping } from "../util";


function OpenErrorListButton({validationErrorsOutputFile}) {
    const openOutputPath = useAppStore(store => store.openOutputFile);

    // open the output file
    function openOutputFile() {
        openOutputPath(validationErrorsOutputFile)
    }


    return (
        <button className="OpenErrorListButton bigButton" onClick={openOutputFile}>Open error list</button>

    )
}

function ValidationFailed({config, inputData, inputFilePath, validationResult, validationErrorsOutputFile, isMappingDocument}) {

    const startPreProcessingFile = useAppStore(store => store.startPreProcessingFile)

    // on retry we simply re-submit the same path
    function retryFileLoad(e) {
        startPreProcessingFile(inputFilePath);
    }


    // filter the error table to only include the ones with an error
    const documentData = {
        sheets: inputData.sheets.map(sheet => (
            {
                name: sheet.name,
                data: sheet.data.filter( row => row.errors)
            }
        ))
    }

    // Add the row number to the list of regular error columns for display
    let columnsConfig = config.data.destination_errors.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
        columnsConfig = [
            // we need to re-add the errors column here to keep the column filtering
            // logic consistent across mapping and non-mapping documents
            { name: "Errors", alias: "errors" },
        ].concat(filterColumnConfigForMapping(config.data, columnsConfig));
    }

    // add the error column to the front of the column list
    const errorColumns = [
        { name: "Row #", alias: "row_number" },
    ].concat(columnsConfig)


    // The file invalid message differs between mapping & assistance documents
    const fileIsNotValidMessage = "Validation finished. Critical errors encountered."

    return (
        <div className="ValidationFailed appScreen">
            <FileInfo filePath={inputFilePath} helpText="The input file is invalid." />

            <SheetTabs documentData={documentData} columnsConfig={errorColumns}/>

            <div className="validationResult error">
                <div className="validationState">
                    {fileIsNotValidMessage}
                    <div className="help">
                        You cannot continue until the noted issues are resolved.
                    </div>
                </div>

                <div className="openErrorList">
                    <OpenErrorListButton validationErrorsOutputFile={validationErrorsOutputFile} />
                </div>
            </div>

            <div className="buttonRow buttonRow2">
                <OpenFileRegion label="Open a different file" />

                <div className="retryButton">
                    <button className="bigButton" onClick={retryFileLoad}>Retry the same file</button>
                </div>
            </div>


        </div>
    )
}

export default ValidationFailed;