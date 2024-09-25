import { useState } from 'react';


import OpenFileRegion from "../components/OpenFileRegion";
import { useAppStore } from '../store';


function MainScreen({config}) {

    // is anything dragged over the screen?
    const [isDraggedOver, setIasDraggedOver] = useState(false);

    const startPreProcessingFile = useAppStore((store) => store.startPreProcessingFile);

    const startConfigChange = useAppStore(store => store.startConfigChange);
    // DRAG HANDLING
    // =============

    function dragEnter(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Dragged over!")
        setIasDraggedOver(true);
    }

    function dragLeave(e) {
        e.preventDefault();
        e.stopPropagation();

        console.log("Dragged leave!")
        setIasDraggedOver(false);
    }

    // React needs a preventDefault stuff in this to signal that this is a drop target element
    function dragOver(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    // Drop handling
    // =============

    function dropped(e) {
        console.log("DROPPED")
        e.preventDefault();
        e.stopPropagation();

        let pathArr = [];
        for (const f of event.dataTransfer.files) {
            // Using the path attribute to get absolute file path
            console.log('File Path of dragged files: ', f.path);
            pathArr.push(f.path); // assemble array for main.js
        }
        console.log(pathArr);
        // TODO: maybe notify the user if multiple files are dragged on the app
        if (pathArr.length > 1) {
            startPreProcessingFile(pathArr[0]);
        }
        // handle dropping if only one file is provided
        if (pathArr.length === 1) {
            // TODO: Electron will have access to the file path, use it here
            const draggedPath = pathArr[0];
            startPreProcessingFile(draggedPath);
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
                {/* Update the configuration File */}
                <button onClick={startConfigChange} className="openConfigFile bigButton"><span class="icon">⚙</span>  Update the configuration </button>
            </div>

            { dropTargetDiv }
        </div>
    )
}

export default MainScreen;