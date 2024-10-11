// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    return splitName[splitName.length - 1];
}



function FileLoading({inputFilePath}) {
    console.log(inputFilePath);
    return (<div className="FileLoading appScreen progressIndicator">
        <div className="loaderWrapper">
            <span className="loader"></span>
        </div>
        <div className="help">
            { inputFilePath.length === 0
                ? <p>Loading file...</p>
                : <p>Loading file: <span className="fileName">{baseFileName(inputFilePath)}</span></p>
            }
        </div>
    </div>)
}

export default FileLoading;