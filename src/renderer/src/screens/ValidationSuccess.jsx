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
import BottomButtons from "../components/BottomButtons";
import FileInfo from "../components/FileInfo";
import PreviewTable from "../components/PreviewTable";
import { useAppStore } from "../store";
import { filterColumnConfigForMapping } from "../util";

function ValidationSuccess({config, document, inputFilePath, isMappingDocument}) {
    const preProcessFileOpenDialog = useAppStore(store => store.preProcessFileOpenDialog);
    const startProcessingFile = useAppStore(store => store.startProcessingFile);

    function processTheFile(e) {
        startProcessingFile(inputFilePath, "/tmp")
    }

    // The schema for displaying the table
    let columnsConfig = config.data.source.columns;

    // if this is a mapping document we need to clean the schema
    if (isMappingDocument) {
        columnsConfig = filterColumnConfigForMapping(config.data, columnsConfig);
    }

    return (
        <div className="ValidationSuccess">
            <FileInfo filePath={inputFilePath} helpText="Ready to process the file" />

            <PreviewTable tableData={document.data} columnsConfig={columnsConfig}/>

            <div className="validationResult ok">
                <div className="validationState">
                    Validation finished. No errors encountered.
                    <div className="help">
                        {
                            isMappingDocument
                                ? "Valid mapping file."
                                : "Valid intended assistance file."
                        }
                    </div>
                </div>
            </div>

            <BottomButtons l_content="Open a different file" l_onClick={preProcessFileOpenDialog} r_onClick={processTheFile} r_content="Process the file" />

        </div>
    )
}

export default ValidationSuccess;