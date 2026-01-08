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

import type { WorkflowState, PreprocessResult, ProcessResult } from '../types';
import { SCREENS } from '../../../common/screens';
import type { Store } from '..';

export type WorkflowSlice = WorkflowState & {
  startPreprocessing: (filePath?: string) => void;
  endPreprocessing: (result: PreprocessResult) => void;

  startProcessing: (filePath: string) => void;
  endProcessing: (result: ProcessResult) => void;

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

  startPreprocessing: (filePath) => set(s => {
    s.inputFilePath = filePath;
    s.screen = SCREENS.FILE_LOADING;
  }, false),

  
  endPreprocessing: ({ isValid, isMappingDocument, document, inputFilePath, errorFilePath }) => set((s) => {
    s.isMappingDocument = isMappingDocument;
    s.document = document;
    s.inputFilePath = inputFilePath;
    s.errorFilePath = errorFilePath;

    s.screen = isValid ? SCREENS.VALIDATION_SUCCESS : SCREENS.VALIDATION_FAILED;
  }, false),

  startProcessing: (filePath) => set(s => {
    s.inputFilePath = filePath;
    s.screen = SCREENS.PROCESSING_IN_PROGRESS;
  }, false),

  endProcessing: ({ isMappingDocument, document, outputFilePath, mappingFilePath }) => set(s => {
    s.isMappingDocument = isMappingDocument;
    s.document = document;
    s.outputFilePath = outputFilePath;
    s.mappingFilePath = mappingFilePath;
    s.screen = SCREENS.PROCESSING_FINISHED;
  }, false),

  cancelWorkflow: () => set(s => {
    s.inputFilePath = undefined;
    s.screen = SCREENS.PROCESSING_CANCELLED;
  }, false),

  backToMain: () => set(s => {
    s.screen = SCREENS.MAIN;
  }, false),
});