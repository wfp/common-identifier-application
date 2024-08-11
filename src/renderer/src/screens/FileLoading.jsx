// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    return splitName[splitName.length - 1];
}



function FileLoading({inputFilePath}) {
    return (<div className="FileLoading appScreen progressIndicator">
        <div className="loaderWrapper">
            <span class="loader"></span>
        </div>
        <div className="help">
            Loading the file
        </div>
        <div className="fileName">
            {baseFileName(inputFilePath)}
        </div>
    </div>)
}

export default FileLoading;