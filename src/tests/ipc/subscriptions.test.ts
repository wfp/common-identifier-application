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
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { registerIpcSubscriptions } from '../../ipc/subscriptions';
import { getState } from '../_storeTestUtils';
import { SCREENS } from '../../../common/screens';

type Handler = (...args: any[]) => void;

describe('IPC subscriptions update store', () => {
  let listeners: Record<string, Handler[]>;

  beforeEach(() => {
    listeners = {
      validationDone: [],
      processingDone: [],
      encryptionDone: [],
      configChanged: [],
      processingCancelled: [],
      error: [],
    };

    (window as any).electronAPI = {
      invoke: {},
      on: {
        validationDone: (h: Handler) => listeners.validationDone.push(h),
        processingDone:    (h: Handler) => listeners.processingDone.push(h),
        processingCancelled: (h: Handler) => listeners.processingCancelled.push(h),
        encryptionDone:   (h: Handler) => listeners.encryptionDone.push(h),
        configChanged:     (h: Handler) => listeners.configChanged.push(h),
        error:             (h: Handler) => listeners.error.push(h),
      },
      __listeners: listeners,
    };

    registerIpcSubscriptions();
  });

  afterEach(() => {
    (window as any).electronAPI = undefined;
  });

  it('validationDone → updates workflow and screen', () => {
    listeners.validationDone.forEach(fn =>
      fn({}, { isValid: true, isMappingDocument: false, document: {}, inputFilePath: 'in.csv', errorFilePath: '' })
    );
    const s = getState();
    expect(s.inputFilePath).toBe('in.csv');
    expect(s.screen).toBe(SCREENS.VALIDATION_SUCCESS);
  });

  it('processingDone → updates workflow and screen', () => {
    listeners.processingDone.forEach(fn =>
      fn({}, { isMappingDocument: false, document: {}, outputFilePath: 'out.csv', mappingFilePath: 'map.csv' })
    );
    const s = getState();
    expect(s.isMappingDocument).toBe(false);
    expect(s.outputFilePath).toBe('out.csv');
    expect(s.mappingFilePath).toBe('map.csv');
    expect(s.screen).toBe(SCREENS.PROCESSING_FINISHED);
  });

  it('encryptionDone(success) → sets encryptedFilePath', () => {
    listeners.encryptionDone.forEach(fn => fn({}, { encryptedFilePath: 'out.csv.gpg' }));
    const s = getState();
    expect(s.encryptedFilePath).toBe('out.csv.gpg');
  });

  it('encryptionDone(failure) → sets error messages', () => {
    listeners.encryptionDone.forEach(fn => fn({}, { encryptedFilePath: '', error: 'Some error', errorCode: "GPG_GENERAL_ERRROR" }));
    const s = getState();
    expect(s.encryptErrorMessage).toMatch(/Some error \(code: GPG_GENERAL_ERRROR\)/);
    expect(s.encryptedFilePath).toBeUndefined();
  });

  it('processingCancelled → moves to PROCESSING_CANCELLED', () => {
    listeners.processingCancelled.forEach(fn => fn({}));
    expect(getState().screen).toBe(SCREENS.PROCESSING_CANCELLED);
  });

  it('error → shows error in store', () => {
    listeners.error.forEach(fn => fn({}, 'This is an error', true));
    const s = getState();
    expect(s.errorMessage).toBe('This is an error');
    expect(s.isRuntimeError).toBe(true);
  });
});
