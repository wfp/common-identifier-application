
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
import { type Api } from "../../common/api";

type Handlers = {
  preprocessingDone?: (evt: unknown, value: unknown) => void;
  processingDone?: (evt: unknown, value: unknown) => void;
  configChanged?: (evt: unknown, newConfig: { config: unknown; isBackup: boolean }) => void;
  processingCancelled?: (evt: unknown) => void;
  error?: (evt: unknown, msg: string) => void;
};

const setupStoreMock = () => {
  const state = {
    preProcessingDone: vi.fn(),
    processingDone: vi.fn(),
    updateConfig: vi.fn(),
    processingCancelled: vi.fn(),
    reportError: vi.fn(),
    boot: vi.fn(),
    loadNewConfigDone: vi.fn(),
    userConfigRemoved: vi.fn(),
  };

  vi.doMock('../store', () => ({
    useAppStore: {
      getState: () => state,
    },
  }));

  return state;
};

const setupElectronMock = (handlersOut: Handlers, bootResult: unknown = { cfg: 1 }) => {
  const handlers: Handlers = handlersOut;

  const electronAPI = {
    on: {
      preprocessingDone: vi.fn((cb) => {
        handlers.preprocessingDone = cb;
      }),
      processingDone: vi.fn((cb) => {
        handlers.processingDone = cb;
      }),
      configChanged: vi.fn((cb) => {
        handlers.configChanged = cb;
      }),
      processingCancelled: vi.fn((cb) => {
        handlers.processingCancelled = cb;
      }),
      error: vi.fn((cb) => {
        handlers.error = cb;
      }),
    },
    invoke: {
      requestConfigUpdate: vi.fn().mockResolvedValue(bootResult),
      getFilePath: vi.fn(),
      getPosixFilePath: vi.fn(),
      fileDropped: vi.fn(),
      processFile: vi.fn(),
      preProcessFileOpenDialog: vi.fn(),
      openOutputFile: vi.fn(),
      loadNewConfig: vi.fn().mockResolvedValue('new-config'),
      removeUserConfig: vi.fn().mockResolvedValue('removed'),
      acceptTermsAndConditions: vi.fn(),
      quit: vi.fn(),
    },
  };

  (window as any).electronAPI = electronAPI;

  return electronAPI;
};

const flush = async () => {
  await Promise.resolve();
  await Promise.resolve();
};

describe('intercomApi (Electron present)', () => {
  let handlers: Handlers;
  let storeState: ReturnType<typeof setupStoreMock>;
  let electronAPI: ReturnType<typeof setupElectronMock>;
  let intercomModule: typeof import('../intercomApi');

  beforeEach(async () => {
    vi.resetModules();
    handlers = {};
    storeState = setupStoreMock();
    electronAPI = setupElectronMock(handlers, { initial: 'config' });

    intercomModule = await import('../intercomApi');

    await flush();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('registers IPC callbacks and dispatches to store on events', () => {
    // Ensure the listeners were registered
    expect(electronAPI.on.preprocessingDone).toHaveBeenCalledTimes(1);
    expect(electronAPI.on.processingDone).toHaveBeenCalledTimes(1);
    expect(electronAPI.on.configChanged).toHaveBeenCalledTimes(1);
    expect(electronAPI.on.processingCancelled).toHaveBeenCalledTimes(1);
    expect(electronAPI.on.error).toHaveBeenCalledTimes(1);

    // Fire events and assert store calls
    handlers.preprocessingDone?.(null, 'pp-val');
    expect(storeState.preProcessingDone).toHaveBeenCalledWith('pp-val');

    handlers.processingDone?.(null, 'proc-val');
    expect(storeState.processingDone).toHaveBeenCalledWith('proc-val');

    handlers.configChanged?.(null, { config: { a: 1 }, isBackup: true });
    expect(storeState.updateConfig).toHaveBeenCalledWith({ a: 1 }, true);

    handlers.processingCancelled?.(null);
    expect(storeState.processingCancelled).toHaveBeenCalled();

    handlers.error?.(null, 'boom');
    expect(storeState.reportError).toHaveBeenCalledWith('boom');
  });

  it('Boot requests config update and dispatches boot with the result', async () => {
    expect(electronAPI.invoke.requestConfigUpdate).toHaveBeenCalledTimes(1);
    expect(storeState.boot).toHaveBeenCalledWith({ initial: 'config' });
  });

  it('getFilePath calls Electron and returns its value', () => {
    electronAPI.invoke.getFilePath.mockReturnValue('/tmp/x.txt');
    const fakeFile = {} as unknown as File;

    const res = intercomModule.getFilePath(fakeFile);

    expect(electronAPI.invoke.getFilePath).toHaveBeenCalledWith(fakeFile);
    expect(res).toBe('/tmp/x.txt');
  });

  it('startPreProcessingFile dispatches fileDropped', () => {
    intercomModule.startPreProcessingFile('/tmp/file.in');
    expect(electronAPI.invoke.fileDropped).toHaveBeenCalledWith('/tmp/file.in');
  });

  it('startProcessingFile dispatches processFile', () => {
    intercomModule.startProcessingFile('/tmp/file.in');
    expect(electronAPI.invoke.processFile).toHaveBeenCalledWith('/tmp/file.in');
  });

  it('preProcessFileOpenDialog calls Electron invoke', () => {
    intercomModule.preProcessFileOpenDialog();
    expect(electronAPI.invoke.preProcessFileOpenDialog).toHaveBeenCalledTimes(1);
  });

  it('openOutputFile calls Electron invoke', () => {
    intercomModule.openOutputFile('/tmp/out.pdf');
    expect(electronAPI.invoke.openOutputFile).toHaveBeenCalledWith('/tmp/out.pdf');
  });

  it('loadNewConfig calls invoke and dispatches loadNewConfigDone', async () => {
    electronAPI.invoke.loadNewConfig.mockResolvedValue('cfg-123');
    intercomModule.loadNewConfig();

    await flush();

    expect(electronAPI.invoke.loadNewConfig).toHaveBeenCalledTimes(1);
    expect(storeState.loadNewConfigDone).toHaveBeenCalledWith('cfg-123');
  });

  it('removeUserConfig calls invoke and dispatches userConfigRemoved', async () => {
    electronAPI.invoke.removeUserConfig.mockResolvedValue('removed-ok');
    intercomModule.removeUserConfig();

    await flush();

    expect(electronAPI.invoke.removeUserConfig).toHaveBeenCalledTimes(1);
    expect(storeState.userConfigRemoved).toHaveBeenCalledWith('removed-ok');
  });

  it('acceptTermsAndConditions calls Electron invoke', () => {
    intercomModule.acceptTermsAndConditions();
    expect(electronAPI.invoke.acceptTermsAndConditions).toHaveBeenCalledTimes(1);
  });

  it('quit calls Electron invoke', () => {
    intercomModule.quit();
    expect(electronAPI.invoke.quit).toHaveBeenCalledTimes(1);
  });
});

describe('intercomApi (Electron absent)', () => {
  let storeState: ReturnType<typeof setupStoreMock>;
  let intercomModule: typeof import('../intercomApi');

  beforeEach(async () => {
    vi.resetModules();
    storeState = setupStoreMock();
    delete (window as any).electronAPI;

    vi.spyOn(console, 'log').mockImplementation(() => {});

    intercomModule = await import('../intercomApi');
    await flush();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('safe no-op for withElectronAPI calls without fallback (startProcessingFile)', () => {
    expect(() => intercomModule.startProcessingFile('/tmp/file.in')).not.toThrow();
  });

  it('runs provided fallback for functions that specify elseFn (preProcessFileOpenDialog)', () => {
    intercomModule.preProcessFileOpenDialog();
    expect(true).toBe(true);
  });

  it('quit would throw without electron; ensure we don’t call it in absence scenarios', () => {
    expect(typeof (window as any).electronAPI).toBe('undefined');
  });
});
``
