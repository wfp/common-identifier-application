function ProcessingInProgress({inputFilePath}) {
    return (<div className="ProcessingInProgress progressIndicator">
        <div className="loaderWrapper">
            <span className="loader"></span>
        </div>
        <div className="help">
            Processing the file...
        </div>
    </div>)
}

export default ProcessingInProgress;