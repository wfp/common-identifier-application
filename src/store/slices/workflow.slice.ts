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
import type { StateCreator } from 'zustand';
import log from 'electron-log/renderer';

import type { CidDocument, IEncryptionDone, IValidationDone, IProcessingDone } from '../../../common/types';
import { SCREENS } from '../../../common/screens';
import type { Store } from '..';

const logger = log.scope('renderer:store');

export type WorkflowSlice = {
  inputFilePath?: string;
  outputFilePath?: string;
  mappingFilePath?: string;
  errorFilePath?: string;

  document?: CidDocument;
  isMappingDocument?: boolean;

  encryptedFilePath?: string;
  encryptErrorMessage?: string;

  startValidation: (filePath?: string) => void;
  endValidation: (result: IValidationDone) => void;

  startProcessing: (filePath: string) => void;
  endProcessing: (result: IProcessingDone) => void;

  startEncryption: (filePath: string) => void;
  endEncryption: (result: IEncryptionDone) => void;

  cancelWorkflow: () => void;
  backToMain: () => void;
}

export const createWorkflowSlice: StateCreator<
  Store,
  [['zustand/immer', unknown]],
  [],
  WorkflowSlice
> = (set) => ({
  inputFilePath: undefined,
  outputFilePath: undefined,
  mappingFilePath: undefined,
  errorFilePath: undefined,
  document: undefined,
  isMappingDocument: undefined,

  encryptedFilePath: undefined,
  encryptErrorMessage: undefined,

  startValidation: (filePath) => set(s => {
    logger.debug(`Starting validation for file: ${filePath}`);
    s.inputFilePath = filePath;
    s.screen = SCREENS.FILE_LOADING;
  }, false),

  
  endValidation: ({ isValid, isMappingDocument, document, inputFilePath, errorFilePath }) => set((s) => {
    logger.debug(`Validation ended. Filepath: ${inputFilePath}, Valid: ${isValid}, Mapping Document: ${isMappingDocument}`);
    s.isMappingDocument = isMappingDocument;
    s.document = document;
    s.inputFilePath = inputFilePath;
    s.errorFilePath = errorFilePath;

    s.screen = isValid ? SCREENS.VALIDATION_SUCCESS : SCREENS.VALIDATION_FAILED;
  }, false),

  startProcessing: (filePath) => set(s => {
    logger.debug(`Starting processing for file: ${filePath}`);
    s.inputFilePath = filePath;
    s.screen = SCREENS.PROCESSING_IN_PROGRESS;
  }, false),

  endProcessing: ({ isMappingDocument, document, outputFilePath, mappingFilePath }) => set(s => {
    logger.debug(`Processing ended. Filepath: ${outputFilePath}, Mapping Document: ${isMappingDocument}`);
    s.isMappingDocument = isMappingDocument;
    s.document = document;
    s.outputFilePath = outputFilePath;
    s.mappingFilePath = mappingFilePath;
    s.screen = SCREENS.PROCESSING_FINISHED;
  }, false),

  startEncryption: (filePath) => set(s => {
    // TODO: some stuff here - maybe set an isEncrypting flag for the UI to show progress?
  }, false),

  endEncryption: ({ encryptedFilePath, error, errorCode }) => set(s => {
    if (error) {
      logger.error(`Encryption error: ${error} (code: ${errorCode})`);
      s.encryptedFilePath = undefined;
      s.encryptErrorMessage = errorCode ? `${error} (code: ${errorCode})` : error;
    }
    else {
      logger.debug(`Encryption ended. Encrypted Filepath: ${encryptedFilePath}`);
      s.encryptedFilePath = encryptedFilePath;
    }
  }, false),

  cancelWorkflow: () => set(s => {
    logger.debug('Workflow cancelled');
    s.inputFilePath = undefined;
    s.screen = SCREENS.PROCESSING_CANCELLED;
  }, false),

  backToMain: () => set(s => {
    logger.debug('Resetting store and returning to main screen');
    s.inputFilePath = undefined;
    s.outputFilePath = undefined;
    s.mappingFilePath = undefined;
    s.encryptedFilePath = undefined;
    s.encryptErrorMessage = undefined;
    s.errorFilePath = undefined;
    s.document = undefined;
    s.isMappingDocument = undefined;
    s.errorMessage = undefined;
    s.screen = SCREENS.MAIN;
  }, false),
});