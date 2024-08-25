
// A version information box (config version, last update)
function VersionInfo({config}) {

    // if the current config is the initial one we dont want to display anything
    if (config.isInitial) {
        return (<></>);
    }

    const {version="UNKNOWN", region="UNKNWON"} = config.data.meta;
    const {lastUpdated, isBackup} = config;

    // TODO: if a different date display format is desirable change it here
    const lastUpdateDate = lastUpdated ? lastUpdated.toLocaleString() : "";

    const backupVersionMarker = isBackup ? (<div className="backupVersionMarker">Using the default configuration</div>) : ([]);

    const classNameString = ["VersionInfo"];
    if (isBackup) classNameString.push("usingBackupConfig")

    return (

        <div className={classNameString.join(' ')}>
            <div className="configVersion">
                <div className="help">Configuration version</div>
                <div className="configVersionData data">
                    <span className="version">{ version }</span>
                    <span className="separator">-</span>
                    <span className="region">{ region }</span>
                </div>
            </div>
            <div className="lastUpdated">
                <div className="help">last updated:</div>
                <div className="lastUpdateDate data">{ lastUpdateDate }</div>
            </div>
            { backupVersionMarker }
        </div>
    )
}

export default VersionInfo;