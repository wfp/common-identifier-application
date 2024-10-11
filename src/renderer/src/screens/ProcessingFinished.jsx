
import BottomButtons from "../components/BottomButtons";
import FileInfo from "../components/FileInfo";
import PreviewTable from "../components/PreviewTable";
import { useAppStore } from "../store";

function ProcessingFinished({ config, outputData, outputFilePaths}) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);
    const preProcessFileOpenDialog = useAppStore(store => store.preProcessFileOpenDialog);

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
        <div className="ProcessingFinished">
            {fileInfoRow}

            <PreviewTable tableData={outputData.sheets[0].data} columnsConfig={columnsConfig} />

            <BottomButtons l_content="Open a different file" l_onClick={preProcessFileOpenDialog} r_onClick={backToMainScreen} r_content="Done" />
        </div>
    )
}

export default ProcessingFinished;