import { useAppStore } from "../store";

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    return splitName[splitName.length - 1];
}

// A single link pointing to a file
function FileRow({path, className=""}) {
    const fileName = baseFileName(path);
    const openOutputPath = useAppStore(store => store.openOutputFile);

    function clickHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        openOutputPath(path)
    }

    return (
        <div className={"fileName " + className}>
            <a href={"file://" + path} onClick={clickHandler} target="_blank">
                {/* 🔗  */}
                {fileName}
            </a>
        </div>
    )
}

// Provides a customizable information about the file-to-be-processed
function FileInfo({filePath, helpText, otherFilePath}) {
    const inputFileName = baseFileName(filePath);

    // const openOutputPath = useAppStore(store => store.openOutputFile);


    // handle the second file row if needed
    let otherFileRow = (<></>);
    if (otherFilePath) {
        otherFileRow = (
            <FileRow path={otherFilePath} className="otherPath" />
        );
    }


    return (
        <div className="FileInfo">
            <div className="help">{ helpText }</div>
            <FileRow path={filePath} />
            {otherFileRow}
        </div>
    )
}

export default FileInfo;