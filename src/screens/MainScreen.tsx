/* ************************************************************************
*  Common Identifier Application
*  Copyright (C) 2026  World Food Programme
*  
*  This program is free software: you can redistribute it and/or modify
*  it under the terms of the GNU Affero General Public License as published by
*  the Free Software Foundation, either version 3 of the License, or
*  (at your option) any later version.
*  
*  This program is distributed in the hope that it will be useful,
*  but WITHOUT ANY WARRANTY; without even the implied warranty of
*  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
*  GNU Affero General Public License for more details.
*  
*  You should have received a copy of the GNU Affero General Public License
*  along with this program.  If not, see <http://www.gnu.org/licenses/>.
************************************************************************ */

import { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { startValidation } from '../store/actions/workflow.action'; 
import { useAppStore } from '../store';
import { SCREENS } from '../../common/screens';

function MainScreen() {
  // is anything dragged over the screen?
  const [isDraggedOver, setIsDraggedOver] = useState(false);
  const { t } = useTranslation();

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

    let droppedFiles: File[] = [];
    for (const f of e.dataTransfer.files) {
      droppedFiles.push(f);
    }

    // if there are zero entries clear the dropzone
    if (droppedFiles.length === 0) {
      setIsDraggedOver(false);
    } else {
      // when at least one file is dropped use the first one
      const filePath = window.electronAPI.invoke.getFilePath(droppedFiles[0]);
      startValidation(filePath);
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
        <h1>{t('mainScreen title')}</h1>
        <h2>{t('mainScreen subtitle')}</h2>
      </div>

      <div className="region region-open-file">
        <button
          className="open-file cid-button cid-button-primary"
          onClick={() => startValidation()}
        >
          {t("mainScreen openFile")}
        </button>
      </div>

      <div className="region region-update-config">
        <button
          onClick={() => useAppStore.getState().go(SCREENS.CONFIG_CHANGE)}
          className="cid-button cid-button-secondary"
        >
          <span className="icon">⚙</span>  {t("mainScreen updateConfig")}
        </button>
      </div>

      {dropTargetDiv}
    </div>
  );
}

export default MainScreen;
