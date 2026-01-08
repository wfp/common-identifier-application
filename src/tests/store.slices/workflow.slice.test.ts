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
import { describe, it, expect, beforeEach } from 'vitest';
import { useAppStore } from '../../store';
import { resetStore, getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

const sampleDoc = {} as any; // minimal CidDocument stub

describe('Workflow slice', () => {
  beforeEach(resetStore);

  it('startPreprocessing sets file and FILE_LOADING', () => {
    useAppStore.getState().startPreprocessing('file.csv');
    const s = getState();
    expect(s.inputFilePath).toBe('file.csv');
    expect(s.screen).toBe(SCREENS.FILE_LOADING);
  });

  it('endPreprocessing(valid) keeps config intact and moves to VALIDATION_SUCCESS', () => {
    useAppStore.getState().boot({
      config: { meta: { id: 'CID', version: '1.2.3', signature: 'abc' } } as any,
      isBackup: false, lastUpdated: new Date(), error: undefined, hasAcceptedTermsAndConditions: true,
    });

    useAppStore.getState().endPreprocessing({
      isValid: true, isMappingDocument: false, document: sampleDoc,
      inputFilePath: 'file.csv', errorFilePath: '',
    });

    const s = getState();
    expect(s.screen).toBe(SCREENS.VALIDATION_SUCCESS);
    expect(s.config.data.meta.id).toBe('CID'); // unchanged by workflow
  });


  it('endPreprocessing(invalid) sets VALIDATION_FAILED and errorFilePath, preserves config', () => {
    // Prepare a non-default config first, to ensure it doesn't get altered
    useAppStore.getState().boot({
      config: { meta: { id: 'CID', version: '1.2.3', signature: 'abc' } } as any,
      isBackup: false,
      lastUpdated: new Date(),
      error: undefined,
      hasAcceptedTermsAndConditions: true,
    });

    useAppStore.getState().endPreprocessing({
      isValid: false,
      isMappingDocument: false,
      document: {} as any,
      inputFilePath: 'in.csv',
      errorFilePath: 'errors.csv',
    });

    const s = getState();
    expect(s.screen).toBe(SCREENS.VALIDATION_FAILED);
    expect(s.inputFilePath).toBe('in.csv');
    expect(s.errorFilePath).toBe('errors.csv');
    // config remains unchanged
    expect(s.config.data.meta.id).toBe('CID');
  });


  it('backToMain() routes to MAIN from various screens', () => {
    const setAndAssert = (screen: SCREENS) => {
      useAppStore.setState({ screen });
      useAppStore.getState().backToMain();
      expect(getState().screen).toBe(SCREENS.MAIN);
    };

    [SCREENS.PROCESSING_CANCELLED,
     SCREENS.PROCESSING_FINISHED,
     SCREENS.CONFIG_UPDATED].forEach(setAndAssert);
  });

  it("cancel workflow clears inputFilePath and route to PROCESSING_CANCELLED", () => {
    useAppStore.setState({ inputFilePath: 'file.csv' });
    useAppStore.getState().cancelWorkflow();
    const s = getState();
    expect(s.inputFilePath).toBeUndefined();
    expect(s.screen).toBe(SCREENS.PROCESSING_CANCELLED);
  });
});
