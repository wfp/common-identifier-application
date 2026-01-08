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
        requestConfigUpdate: vi.fn().mockResolvedValue({ ok: true }),
        loadNewConfig: vi.fn().mockResolvedValue({ success: true }),
        removeUserConfig: vi.fn().mockResolvedValue({ success: true }),
        fileDropped: vi.fn().mockResolvedValue(undefined),
        processFile: vi.fn().mockResolvedValue(undefined),
        preProcessFileOpenDialog: vi.fn().mockResolvedValue(undefined),
        openOutputFile: vi.fn().mockResolvedValue(undefined),
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

  it('requestConfigUpdate forwards to preload and returns response', async () => {
    const resp = await bridge.requestConfigUpdate();
    expect(resp).toEqual({ ok: true });
    expect((window as any).electronAPI.invoke.requestConfigUpdate).toHaveBeenCalled();
  });

  it('loadNewConfig forwards to preload and returns response', async () => {
    const resp = await bridge.loadNewConfig();
    expect(resp).toEqual({ success: true });
    expect((window as any).electronAPI.invoke.loadNewConfig).toHaveBeenCalled();
  });

  it('fileDropped triggers invoke', async () => {
    await bridge.fileDropped("some/path/file.csv");
    expect((window as any).electronAPI.invoke.fileDropped).toHaveBeenCalled();
  });

  it('preProcessFileOpenDialog triggers invoke', async () => {
    await bridge.preProcessFileOpenDialog();
    expect((window as any).electronAPI.invoke.preProcessFileOpenDialog).toHaveBeenCalled();
  });

  it('processFile triggers invoke', async () => {
    await bridge.processFile("some/path/file.csv");
    expect((window as any).electronAPI.invoke.processFile).toHaveBeenCalled();
  });

  it('openOutputFile triggers invoke', async () => {
    await bridge.openOutputFile("some/path/file.csv");
    expect((window as any).electronAPI.invoke.openOutputFile).toHaveBeenCalled();
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
      preprocessingDone: [],
      processingDone: [],
      configChanged: [],
      processingCancelled: [],
      error: [],
    };

    (window as any).electronAPI = {
      invoke: {},
      on: {
        preprocessingDone: (h: Handler) => listeners.preprocessingDone.push(h),
        processingDone:    (h: Handler) => listeners.processingDone.push(h),
        configChanged:     (h: Handler) => listeners.configChanged.push(h),
        processingCancelled: (h: Handler) => listeners.processingCancelled.push(h),
        error:             (h: Handler) => listeners.error.push(h),
        // Optional "off" support if your preload exposes it:
        off: {
          preprocessingDone: (h: Handler) => listeners.preprocessingDone = listeners.preprocessingDone.filter(x => x !== h),
          processingDone:    (h: Handler) => listeners.processingDone    = listeners.processingDone.filter(x => x !== h),
          configChanged:     (h: Handler) => listeners.configChanged     = listeners.configChanged.filter(x => x !== h),
          processingCancelled: (h: Handler) => listeners.processingCancelled = listeners.processingCancelled.filter(x => x !== h),
          error:             (h: Handler) => listeners.error             = listeners.error.filter(x => x !== h),
        },
      },
      __listeners: listeners,
    };
  });

  afterEach(() => {
    (window as any).electronAPI = undefined;
  });

  it('on.preprocessingDone registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.preprocessingDone,
    (...args) => listeners.preprocessingDone.forEach(fn => fn(args)),
    () => listeners.preprocessingDone = [],
    [{}, { isValid: true, isMappingDocument: false, document: { name: "", data: []}, inputFilePath: 'in.csv', errorFilePath: '' }]
  ));
   
  it('on.processingDone registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.processingDone,
    (...args) => listeners.processingDone.forEach(fn => fn(args)),
    () => listeners.processingDone = [],
    [{}, { isMappingDocument: false, document: { name: "", data: []}, outputFilePath: 'out.csv', mappingFilePath: 'map.csv' }]
  ));

  it('on.configChanged registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.configChanged,
    (...args) => listeners.configChanged.forEach(fn => fn(args)),
    () => listeners.configChanged = [],
    [{}, { config: { key: 'value' }, isBackup: false }]
  ));

  it('on.processingCancelled registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.processingCancelled,
    (...args) => listeners.processingCancelled.forEach(fn => fn(args)),
    () => listeners.processingCancelled = [],
    [{}]
  ));

  it('on.error registers and unsubscribes', () => testBridgeUnsubscription(
    bridge.on.error,
    (...args) => listeners.error.forEach(fn => fn(args)),
    () => listeners.error = [],
    [{}, "An error occurred"]
  ));
});

describe("IPC Bridge - handling no electron", () => {
  it('invoke methods do not throw when electronAPI is missing', async () => {
      (window as any).electronAPI = undefined;
      await expect(bridge.requestConfigUpdate()).resolves.toBeUndefined();
      await expect(bridge.quit()).resolves.toBeUndefined();
    });

    it('event registrations return no-op unsubscribes', () => {
      const unsub = bridge.on.processingCancelled(() => {});
      expect(typeof unsub).toBe('function');
      expect(() => unsub()).not.toThrow();
    });
});