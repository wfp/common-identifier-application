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
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import * as bridge from '../../ipc/intercom-bridge';

describe('IPC bridge invokes', () => {
  beforeEach(() => {
    (window as any).electronAPI = {
      invoke: {
        loadSystemConfig: vi.fn().mockResolvedValue({ ok: true }),
        loadNewConfig: vi.fn().mockResolvedValue({ success: true }),
        removeConfig: vi.fn().mockResolvedValue({ success: true }),

        validateFileDropped: vi.fn().mockResolvedValue(undefined),
        validateFileOpenDialogue: vi.fn().mockResolvedValue(undefined),
        processFile: vi.fn().mockResolvedValue(undefined),
        encryptFile: vi.fn().mockResolvedValue(undefined),

        openOutputFile: vi.fn().mockResolvedValue(undefined),
        revealInDirectory: vi.fn().mockResolvedValue(undefined),

        acceptTermsAndConditions: vi.fn().mockResolvedValue(undefined),
        quit: vi.fn().mockResolvedValue(undefined),
        getFilePath: vi.fn().mockResolvedValue('/abs/file.csv'),
        getPosixFilePath: vi.fn().mockResolvedValue('/abs/file.csv'),
      },
      on: {},
    };
  });

  afterEach(() => {
    (window as any).electronAPI = undefined;
    vi.restoreAllMocks();
  });

  it('loadSystemConfig forwards to preload and returns response', async () => {
    const resp = await bridge.loadSystemConfig();
    expect(resp).toEqual({ ok: true });
    expect((window as any).electronAPI.invoke.loadSystemConfig).toHaveBeenCalled();
  });

  it('loadNewConfig forwards to preload and returns response', async () => {
    const resp = await bridge.loadNewConfig();
    expect(resp).toEqual({ success: true });
    expect((window as any).electronAPI.invoke.loadNewConfig).toHaveBeenCalled();
  });

  it('removeConfig forwards to preload and returns response', async () => {
    const resp = await bridge.removeConfig();
    expect(resp).toEqual({ success: true });
    expect((window as any).electronAPI.invoke.removeConfig).toHaveBeenCalled();
  });

  it('validateFileDropped triggers invoke', async () => {
    await bridge.validateFileDropped("some/path/file.csv");
    expect((window as any).electronAPI.invoke.validateFileDropped).toHaveBeenCalled();
  });

  it('validateFileOpenDialogue triggers invoke', async () => {
    await bridge.validateFileOpenDialogue();
    expect((window as any).electronAPI.invoke.validateFileOpenDialogue).toHaveBeenCalled();
  });

  it('processFile triggers invoke', async () => {
    await bridge.processFile("some/path/file.csv");
    expect((window as any).electronAPI.invoke.processFile).toHaveBeenCalled();
  });

  it('encryptFile triggers invoke', async () => {
    await bridge.encryptFile("some/path/file.csv");
    expect((window as any).electronAPI.invoke.encryptFile).toHaveBeenCalled();
  });  

  it('openOutputFile triggers invoke', async () => {
    await bridge.openOutputFile("some/path/file.csv");
    expect((window as any).electronAPI.invoke.openOutputFile).toHaveBeenCalled();
  });

  it('revealInDirectory triggers invoke', async () => {
    await bridge.revealInDirectory("some/path/file.csv");
    expect((window as any).electronAPI.invoke.revealInDirectory).toHaveBeenCalled();
  });

  it('acceptTermsAndConditions triggers invoke', async () => {
    await bridge.acceptTermsAndConditions();
    expect((window as any).electronAPI.invoke.acceptTermsAndConditions).toHaveBeenCalled();
  });

  it('quit triggers invoke', async () => {
    await bridge.quit();
    expect((window as any).electronAPI.invoke.quit).toHaveBeenCalled();
  });

  it('getFilePath triggers invoke', async () => {
    await bridge.getFilePath({} as File);
    expect((window as any).electronAPI.invoke.getFilePath).toHaveBeenCalled();
  });

  it('getPosixFilePath triggers invoke', async () => {
    await bridge.getPosixFilePath({} as File);
    expect((window as any).electronAPI.invoke.getPosixFilePath).toHaveBeenCalled();
  });
});


type Handler = (...args: any[]) => void;

const testBridgeUnsubscription = <T extends any[]>(
  registerFn: (callback: (...args: T) => void) => (() => void),
  triggerListeners: (...args: T) => void,
  clearFn: () => void,
  testArgs: T
) => {
  clearFn();
  const spy = vi.fn();
  const unsub = registerFn(spy);
  // 1. First trigger: verify receipt
  triggerListeners(...testArgs);
  expect(spy).toHaveBeenCalledTimes(1);
  // 2. Unsubscribe
  unsub();
  // 3. Second trigger: verify NO new receipt
  triggerListeners(...testArgs);
  expect(spy).toHaveBeenCalledTimes(1); // Should still be 1
};
describe('IPC bridge events', () => {
  let listeners: Record<string, Handler[]>;

  beforeEach(() => {
    listeners = {
      validationFinished: [],
      processingFinished: [],
      encryptionFinished: [],
      workflowCancelled: [],
      error: [],
    };

    (window as any).electronAPI = {
      invoke: {
        unsubscribe: (event: string, handler: Handler) => {
          listeners[event] = listeners[event].filter(h => h !== handler);
        }
      },
      on: {
        validationDone: (h: Handler) => listeners.validationFinished.push(h),
        processingDone:    (h: Handler) => listeners.processingFinished.push(h),
        encryptionDone:   (h: Handler) => listeners.encryptionFinished.push(h),
        processingCancelled: (h: Handler) => listeners.workflowCancelled.push(h),
        error:             (h: Handler) => listeners.error.push(h),
      },
      __listeners: listeners,
    };
  });

  afterEach(() => {
    (window as any).electronAPI = undefined;
  });

  it('on.validationDone registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.validationDone,
    (...args) => listeners.validationFinished.forEach(fn => fn(...args)),
    () => listeners.validationFinished = [],
    [{}, { isValid: true, isMappingDocument: false, document: { name: "", data: []}, inputFilePath: 'in.csv', errorFilePath: '' }]
  ));
   
  it('on.processingDone registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.processingDone,
    (...args) => listeners.processingFinished.forEach(fn => fn(...args)),
    () => listeners.processingFinished = [],
    [{}, { isMappingDocument: false, document: { name: "", data: []}, outputFilePath: 'out.csv', mappingFilePath: 'map.csv' }]
  ));

  it('on.encryptionDone registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.encryptionDone,
    (...args) => listeners.encryptionFinished.forEach(fn => fn(...args)),
    () => listeners.encryptionFinished = [],
    [{}, { encryptedFilePath: 'out.csv.gpg' }]
  ));

  it('on.processingCancelled registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.processingCancelled,
    (...args) => listeners.workflowCancelled.forEach(fn => fn(...args)),
    () => listeners.workflowCancelled = [],
    [{}]
  ));

  it('on.error registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.error,
    (...args) => listeners.error.forEach(fn => fn(...args)),
    () => listeners.error = [],
    [{}, "An error occurred"]
  ));
});
