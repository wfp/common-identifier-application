import OpenFileButton from "../components/OpenFileButton";

// Displays a general "Open a file" area in the app
function OpenFileRegion({label}) {
    return (

        <div className="openFileRegion">
            <OpenFileButton label={label}/>
            {/* <div className="help">(or drop a new config file to update the configuration)</div> */}
        </div>
    );
}

export default OpenFileRegion;