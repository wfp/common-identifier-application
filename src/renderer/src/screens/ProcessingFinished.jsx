
import FileInfo from "../components/FileInfo";
import SheetTabs from "../components/SheetTabs";
import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from "../store";

function ProcessingFinished({ config, outputData, outputFilePaths}) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // clean the data we show to the user to only include the desired columns
    const isMappingDocument = outputFilePaths.length === 1;


    const fileInfoRow = isMappingDocument ?
        (<FileInfo filePath={outputFilePaths[0]} helpText="Saved as" />) :
        (<FileInfo filePath={outputFilePaths[0]} otherFilePath={outputFilePaths[1]} helpText="Saved as" />);


    // if this was a mapping-only document
    const columnsConfig = isMappingDocument ?
        config.data.destination_map.columns :
        config.data.destination.columns;


    return (
        <div className="ProcessingFinished appScreen">
            {fileInfoRow}
            {/* <FileInfo filePath={outputFilePath} otherFilePath={mappingFilePath} helpText="Saved as" /> */}

            <SheetTabs documentData={outputData} columnsConfig={columnsConfig} />

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