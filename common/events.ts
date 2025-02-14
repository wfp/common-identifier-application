// Common Identifier Application
// Copyright (C) 2024 World Food Programme

// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU Affero General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.

// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU Affero General Public License for more details.

// You should have received a copy of the GNU Affero General Public License
// along with this program.  If not, see <http://www.gnu.org/licenses/>.
export enum EVENT {
  FILE_DROPPED = 'fileDropped',

  PREPROCESSING_DONE = 'preprocessingDone',
  PROCESS_FILE = 'processFile',
  PROCESSING_DONE = 'processingDone',
  PREPROCESS_FILE_OPEN_DIALOG = 'preProcessFileOpenDialog',
  PROCESSING_CANCELLED = 'processingCancelled',
  OPEN_OUTPUT_FILE = 'openOutputFile',

  CONFIG_CHANGED = 'configChanged',
  REQUEST_CONFIG_UPDATE = 'requestConfigUpdate',
  LOAD_NEW_CONFIG = 'loadNewConfig',
  REMOVE_USER_CONFIG = 'removeUserConfig',

  QUIT = 'quit',
  ERROR = 'error',
  ACCEPT_TERMS_AND_CONDITIONS = 'acceptTermsAndConditions',
}