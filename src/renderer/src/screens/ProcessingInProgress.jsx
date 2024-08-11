function ProcessingInProgress({inputFilePath}) {
    return (<div className="ProcessingInProgress appScreen progressIndicator">
        <div className="loaderWrapper">
            <span class="loader"></span>
        </div>
        <div className="help">
            Processing the file
        </div>
    </div>)
}

export default ProcessingInProgress;