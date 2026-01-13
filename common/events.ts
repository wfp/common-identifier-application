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
  
  VALIDATION_START_DROP = 'validationStartDrop',           // start validation on dropped file
  VALIDATION_START_DIALOGUE = 'validationStartDialogue',   // start validation on file selected from open file dialog

  VALIDATION_FINISHED = 'validationFinished',

  PROCESSING_START = 'processingStart',
  PROCESSING_FINISHED = 'processingFinished',

  ENCRYPTION_START = 'encryptionStart',
  ENCRYPTION_FINISHED = 'encryptionFinished',

  OPEN_OUTPUT_FILE = 'openOutputFile',
  REVEAL_IN_DIRECTORY = 'revealInDirectory',

  ACCEPT_TERMS_AND_CONDITIONS = 'acceptTermsAndConditions',

  CONFIG_LOAD_SYSTEM = 'configLoadSystem',
  CONFIG_LOAD_NEW = 'configLoadNew',
  CONFIG_REMOVE = 'configRemove',

  GET_FILE_PATH = 'getFilePath',
  GET_POSIX_FILE_PATH = 'getPosixFilePath',

  QUIT = 'quit',
  ERROR = 'error',
}


type EventRegistry = { [K in keyof typeof EVENT]: string };
export const ALL_EVENTS = {
  WORKFLOW_CANCELLED: 'event',
  VALIDATION_START_DROP: 'event',
  VALIDATION_START_DIALOGUE: 'event',
  VALIDATION_FINISHED: 'event',
  PROCESSING_START: 'event',
  PROCESSING_FINISHED: 'event',
  ENCRYPTION_START: 'event',
  ENCRYPTION_FINISHED: 'event',
  OPEN_OUTPUT_FILE: 'event',
  REVEAL_IN_DIRECTORY: 'event',
  ACCEPT_TERMS_AND_CONDITIONS: 'event',

  GET_FILE_PATH: 'event',
  GET_POSIX_FILE_PATH: 'event',
  QUIT: 'event',
  ERROR: 'event',

  CONFIG_LOAD_SYSTEM: 'handle',
  CONFIG_LOAD_NEW: 'handle',
  CONFIG_REMOVE: 'handle',
} satisfies EventRegistry;