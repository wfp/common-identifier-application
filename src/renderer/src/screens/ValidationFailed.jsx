
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

function ValidationErrorSummary(validationResult) {
    return (
        <div className="validationErrors">
            <div className="help">
                One or more rows of the input file failed the validation.
            </div>
            <div className="openErrorList">
                <OpenErrorListButton />
            </div>
        </div>
    )
}

function ValidationFailed({inputData, inputFilePath, validationResult, validationErrorsOutputFile}) {

    const startPreProcessingFile = useAppStore(store => store.startPreProcessingFile)

    // on retry we simply re-submit the same path
    function retryFileLoad(e) {
        startPreProcessingFile(inputFilePath);
    }


    return (
        <div className="ValidationFailed appScreen">
            <FileInfo filePath={inputFilePath} helpText="input file is invalid" />

            <SheetTabs inputData={inputData}/>

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
                {/* <ValidationErrorSummary validationResult={validationResult} /> */}
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