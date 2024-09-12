
import FileInfo from "../components/FileInfo";
import OpenFileRegion from "../components/OpenFileRegion";
import SheetTabs from "../components/SheetTabs";
import { useAppStore } from "../store";


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

function ValidationFailed({config, inputData, inputFilePath, validationResult, validationErrorsOutputFile}) {

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
    const errorColumns = [
        { name: "Row #", alias: "row_number" },
    ].concat(config.data.destination_errors.columns)


    return (
        <div className="ValidationFailed appScreen">
            <FileInfo filePath={inputFilePath} helpText="input file is invalid" />

            <SheetTabs documentData={documentData} columnsConfig={errorColumns}/>

            <div className="validationResult error">
                <div className="validationErrors">
                    <div className="validationState">
                        File is NOT Valid
                        <div className="help">
                            One or more rows of the input file failed the validation.
                        </div>
                    </div>

                    <div className="openErrorList">
                        <OpenErrorListButton validationErrorsOutputFile={validationErrorsOutputFile} />
                    </div>
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