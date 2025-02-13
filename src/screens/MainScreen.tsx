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
import { useAppStore } from '../store';

function MainScreen() {
  // is anything dragged over the screen?
  const [isDraggedOver, setIsDraggedOver] = useState(false);

  const preProcessFileOpenDialog = useAppStore(
    (store) => store.preProcessFileOpenDialog,
  );
  const startPreProcessingFile = useAppStore(
    (store) => store.startPreProcessingFile,
  );

  const startConfigChange = useAppStore((store) => store.startConfigChange);
  // DRAG HANDLING
  // =============

  function dragEnter(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsDraggedOver(true);
  }

  function dragLeave(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    setIsDraggedOver(false);
  }

  // React needs a preventDefault stuff in this to signal that this is a drop target element
  function dragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();
  }

  // Drop handling
  // =============

  function dropped(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    e.stopPropagation();

    let droppedPaths = [];
    for (const f of e.dataTransfer.files) {
      // Using the path attribute to get absolute file path
      // @ts-ignore File.path is only supported in electron environments
      droppedPaths.push(f.path);
    }

    // if there are zero entries clear the dropzone
    if (droppedPaths.length === 0) {
      setIsDraggedOver(false);
    } else {
      // when at least one file is dropped use the first one
      startPreProcessingFile(droppedPaths[0]);
    }
  }

  const divClassName = [
    'main-screen',
    isDraggedOver ? 'draggedOver' : 'notDraggedOver',
  ]
    .filter((v) => v)
    .join(' ');

  const dropTargetDiv = isDraggedOver ? (
    <div
      className="drop-target"
      onDragLeave={dragLeave}
      onDragOver={dragOver}
      onDrop={dropped}
    >
      <div className="drop-target-inner">Drop to open the file</div>
    </div>
  ) : (
    <div></div>
  );

  return (
    <div className={divClassName} onDragEnter={dragEnter}>
      <div className="region region-main">
        <h1>DRAG & DROP AN EXCEL OR CSV FILE</h1>
        <h2>to start processing</h2>
      </div>

      <div className="region region-open-file">
        <button
          className="open-file cid-button cid-button-primary"
          onClick={preProcessFileOpenDialog}
        >
          Open a file
        </button>
      </div>

      <div className="region region-update-config">
        <button
          onClick={startConfigChange}
          className="cid-button cid-button-secondary"
        >
          <span className="icon">⚙</span> Update the configuration{' '}
        </button>
      </div>

      {dropTargetDiv}
    </div>
  );
}

export default MainScreen;
