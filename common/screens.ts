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
export enum SCREENS {
  BOOT = 'Boot',
  WELCOME = 'Welcome',
  MAIN = 'Main',
  FILE_LOADING = 'FileLoading',

  VALIDATION_SUCCESS = 'ValidationSuccess',
  VALIDATION_FAILED = 'ValidationFailed',

  PROCESSING_IN_PROGRESS = 'ProcessingInProgress',
  PROCESSING_FINISHED = 'ProcessingFinished',
  PROCESSING_CANCELLED = 'ProcessingCancelled',

  LOAD_NEW_CONFIG = 'LoadNewConfig',
  CONFIG_UPDATED = 'ConfigUpdated',
  ERROR = 'Error',
  INVALID_CONFIG = 'InvalidConfig',
  CONFIG_CHANGE = 'ConfigChange',
}