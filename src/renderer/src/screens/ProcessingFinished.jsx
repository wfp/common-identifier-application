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

import FileInfo from "../components/FileInfo";
import SheetTabs from "../components/SheetTabs";
import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from "../store";

function ProcessingFinished({ config, outputData, outputFilePaths}) {

    const backToMainScreen = useAppStore(store => store.backToMainScreen);

    // clean the data we show to the user to only include the desired columns
    const isMappingDocument = outputFilePaths.length === 1;


    const fileInfoRow = isMappingDocument ?
        (<FileInfo filePath={outputFilePaths[0]} helpText="Saved as" />) :
        (<FileInfo filePath={outputFilePaths[0]} otherFilePath={outputFilePaths[1]} helpText="Saved as" />);


    // if this was a mapping-only document
    const columnsConfig = isMappingDocument ?
        config.data.destination_map.columns :
        config.data.destination.columns;


    return (
        <div className="ProcessingFinished appScreen">
            {fileInfoRow}
            {/* <FileInfo filePath={outputFilePath} otherFilePath={mappingFilePath} helpText="Saved as" /> */}

            <SheetTabs documentData={outputData} columnsConfig={columnsConfig} />

            <div className="buttonRow buttonRow2">
                <OpenFileRegion label="Process another file" />

                <div className="doneButton">
                    <button className="bigButton" onClick={backToMainScreen}>Done</button>
                </div>
            </div>
        </div>
    )
}

export default ProcessingFinished;