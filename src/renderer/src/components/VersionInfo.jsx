/*
 * This file is part of Building Blocks CommonID Tool
 * Copyright (c) 2024 WFP
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, version 3.
 *
 * This program is distributed in the hope that it will be useful, but
 * WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the GNU
 * General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

// A version information box (config version, last update)
function VersionInfo({config}) {

    // if the current config is the initial one we dont want to display anything
    if (config.isInitial) {
        return (<></>);
    }

    const {version="UNKNOWN", region="UNKNWON"} = config.data.meta;
    const {lastUpdated, isBackup} = config;


    const classNameString = ["VersionInfo"];
    let secondBlock = (<></>);

    // if this is a backup display that as the second element
    if (isBackup) {
        classNameString.push("usingBackupConfig")

        secondBlock = (
            <div className="backupVersionMarker">
                Using the default configuration
            </div>
        );
    } else {
        // TODO: if a different date display format is desirable change it here
        const lastUpdateDate = lastUpdated ? lastUpdated.toLocaleString() : "";

        secondBlock = (
            <div className="lastUpdated">
                <div className="help">last updated:</div>
                <div className="lastUpdateDate data">{ lastUpdateDate }</div>
            </div>
        );
    }

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
            { secondBlock }
        </div>
    )
}

export default VersionInfo;