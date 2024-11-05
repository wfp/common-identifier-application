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
import { format as dateFmt } from 'date-fns';

function VersionInfo({config}) {

    // if the current config is the initial one we dont want to display anything
    if (config.isInitial) {
        return (<></>);
    }

    const {version="UNKNOWN", region="UNKNOWN"} = config.data.meta;
    const {lastUpdated, isBackup} = config;


    const classNameString = ["version-info"];
    let versionString = `${version}-${region}`
    let lastUpdateDate = lastUpdated ? dateFmt(lastUpdated, "yyyy/MM/dd HH:mm") : "";

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