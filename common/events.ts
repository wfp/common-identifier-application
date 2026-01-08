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
export enum EVENT {
  WORKFLOW_CANCELLED = 'workflowCancelled',
  
  PREPROCESSING_START_DROP = 'preprocessingStartDrop',           // start preprocessing on dropped file
  PREPROCESSING_START_DIALOGUE = 'preprocessingStartDialogue',   // start preprocessing on file selected from open file dialog

  PREPROCESSING_FINISHED = 'preprocessingFinished',

  PROCESSING_START = 'processingStart',
  PROCESSING_FINISHED = 'processingFinished',

  OPEN_OUTPUT_FILE = 'openOutputFile',

  ACCEPT_TERMS_AND_CONDITIONS = 'acceptTermsAndConditions',
  CONFIG_REQUEST_UPDATE = 'configRequestUpdate',
  CONFIG_LOAD_NEW = 'configLoadNew',
  CONFIG_REMOVE = 'configRemove',
  CONFIG_CHANGED = 'configChanged',

  QUIT = 'quit',
  ERROR = 'error',
}