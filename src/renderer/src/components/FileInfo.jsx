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

import { useAppStore } from "../store";

// Returns the "base name" (the plain file name, the last component of the path, without any directories)
function baseFileName(filePath) {
    const splitName = filePath.split(/[\\/]/);
    return splitName[splitName.length - 1];
}

// A single link pointing to a file
function FileRow({path, className=""}) {
    const fileName = baseFileName(path);
    const openOutputPath = useAppStore(store => store.openOutputFile);

    function clickHandler(e) {
        e.preventDefault();
        e.stopPropagation();

        openOutputPath(path)
    }

    return (
        <div className={"fileName " + className}>
            <a href={"file://" + path} onClick={clickHandler} target="_blank">
                {/* 🔗  */}
                {fileName}
            </a>
        </div>
    )
}

// Provides a customizable information about the file-to-be-processed
function FileInfo({filePath, helpText, otherFilePath}) {
    const inputFileName = baseFileName(filePath);

    // const openOutputPath = useAppStore(store => store.openOutputFile);


    // handle the second file row if needed
    let otherFileRow = (<></>);
    if (otherFilePath) {
        otherFileRow = (
            <FileRow path={otherFilePath} className="otherPath" />
        );
    }


    return (
        <div className="FileInfo">
            <div className="help">{ helpText }</div>
            <FileRow path={filePath} />
            {otherFileRow}
            {/* <div className="fileName">
                <a href={"file://" + filePath} onClick={clickHandler} target="_blank">
                    {inputFileName}
                </a>
            </div> */}
        </div>
    )
}

export default FileInfo;