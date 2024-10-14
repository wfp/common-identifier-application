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

import { useState } from 'react';


import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from '../store';


function MainScreen({config}) {

    // is anything dragged over the screen?
    const [isDraggedOver, setIsDraggedOver] = useState(false);

    const startPreProcessingFile = useAppStore((store) => store.startPreProcessingFile);

    const startConfigChange = useAppStore(store => store.startConfigChange);
    // DRAG HANDLING
    // =============

    function dragEnter(e) {
        e.preventDefault();
        e.stopPropagation();

        setIsDraggedOver(true);
    }

    function dragLeave(e) {
        e.preventDefault();
        e.stopPropagation();

        setIsDraggedOver(false);
    }

    // React needs a preventDefault stuff in this to signal that this is a drop target element
    function dragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Drop handling
    // =============

    function dropped(e) {
        e.preventDefault();
        e.stopPropagation();

        let droppedPaths = [];
        for (const f of e.dataTransfer.files) {
            // Using the path attribute to get absolute file path
            droppedPaths.push(f.path);
        }
        console.log("Dropped file paths:", droppedPaths);


        // if there are zero entries clear the dropzone
        if (droppedPaths.length === 0) {
            console.log("No file paths found, ignoring drop...")
            setIsDraggedOver(false);
        } else {
            // when at least one file is dropped use the first one
            startPreProcessingFile(droppedPaths[0]);
        }

    }


    const divClassName = [
        "MainScreen appScreen",
        isDraggedOver ? "draggedOver" : "notDraggedOver",
    ].filter(v => v).join(' ');

    const dropTargetDiv = isDraggedOver ?
        (<div className="dropTarget" onDragLeave={dragLeave} onDragOver={dragOver} onDrop={dropped}>
            <div className="dropTargetInner">
                Drop to open the file
            </div>
        </div>) :
        <div></div>

    return (
        <div className={divClassName} onDragEnter={dragEnter}>
            <div className="mainDragAndDropArea">
                <span className="large">DRAG & DROP AN EXCEL OR CSV FILE</span>
                <span className="small">to start processing</span>
            </div>


            <OpenFileRegion label="Open a file" />

            <div className="updateConfig">
                <button onClick={startConfigChange} className="openConfigFile bigButton"><span class="icon">⚙</span>  Update the configuration </button>
            </div>

            { dropTargetDiv }
        </div>
    )
}

export default MainScreen;