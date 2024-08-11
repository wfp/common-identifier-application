import { useAppStore } from "../store";

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    return splitName[splitName.length - 1];
}

// Provides a customizable information about the file-to-be-processed
function FileInfo({filePath, helpText}) {
    const inputFileName = baseFileName(filePath);

    const openOutputPath = useAppStore(store => store.openOutputFile);

    function clickHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        openOutputPath(filePath)
    }

    return (
        <div className="FileInfo">
            <div className="help">{ helpText }</div>
            <div className="fileName">
                <a href={"file://" + filePath} onClick={clickHandler} target="_blank">
                    {/* 🔗  */}
                    {inputFileName}
                </a>
            </div>
        </div>
    )
}

export default FileInfo;