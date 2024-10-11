
// A version information box (config version, last update)
function VersionInfo({config}) {

    // if the current config is the initial one we dont want to display anything
    if (config.isInitial) {
        return (<></>);
    }

    const {version="UNKNOWN", region="UNKNOWN"} = config.data.meta;
    const {lastUpdated, isBackup} = config;


    const classNameString = ["version-info"];
    let versionString = `${version}-${region}`
    let lastUpdateDate = lastUpdated ? lastUpdated.toLocaleString([], { dateStyle: "short", timeStyle: "short" }) : "";

    // if this is a backup display that as the second element
    if (isBackup) {
        classNameString.push("usingBackupConfig")
        versionString = "DEFAULT (" + versionString + ")"
    }

    return (

        <div className={classNameString.join(' ')}>
            <dl>
                <div>
                    <dt>Version:</dt>
                    <dd>{versionString}</dd>
                </div>
                { !isBackup 
                    ? <div><dt>Last Updated:</dt><dd>{ lastUpdateDate }</dd></div>
                    : null
                }
            </dl>
        </div>
    )
}

export default VersionInfo;