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
import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '../store';
import { SCREENS } from '../../common/screens';
import { describe, expect, it, test, vi } from 'vitest';

declare global {
  interface Window {
    electronAPI?: {
      invoke: {
        getFilePath: (...args: any[]) => any;
        getPosixFilePath: (...args: any[]) => any;
        requestConfigUpdate: (...args: any[]) => any;
        loadNewConfig: (...args: any[]) => any;
        removeUserConfig: (...args: any[]) => any;
        acceptTermsAndConditions: (...args: any[]) => any;
        preProcessFileOpenDialog: (...args: any[]) => any;
        fileDropped: (...args: any[]) => any;
        processFile: (...args: any[]) => any;
        openOutputFile: (...args: any[]) => any;
        quit: (...args: any[]) => any;
      };
      on: {
        error: (...args: any[]) => any;
        configChanged: (...args: any[]) => any;
        processingDone: (...args: any[]) => any;
        preprocessingDone: (...args: any[]) => any;
        processingCancelled: (...args: any[]) => any;
      };
    };
  }
}

describe('useAppStore', () => {
  beforeAll(() => setWindowContext());
  // BOOT AND INITIAL STATES
  it('should initialize with the correct default state', () => {
    const { result } = renderHook(() => useAppStore());
    expect(result.current.screen).toBe(SCREENS.BOOT);
    expect(result.current.config.isInitial).toBe(true);
    expect(result.current.config.isBackup).toBe(false);
    expect(result.current.config.data).toEqual({
      meta: { id: 'UNKNOWN', version: '0.0.0', signature: '' },
    });
  });

  it('should update the config and screen on boot', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: 'TEST', version: '1.0.0', signature: 'test' } },
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
      });
    });
    expect(result.current.screen).toBe(SCREENS.MAIN);
    expect(result.current.config.isBackup).toEqual(false);
    expect(result.current.config.data).toEqual({
      meta: { id: 'TEST', version: '1.0.0', signature: 'test' },
    });
  });

  it('should show the T&Cs if not already accepted', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: 'TEST', version: '1.0.0', signature: 'test' } },
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: false,
      });
    });
    expect(result.current.screen).toBe(SCREENS.WELCOME);
    expect(result.current.config.isBackup).toEqual(false);
    expect(result.current.config.data).toEqual({
      meta: { id: 'TEST', version: '1.0.0', signature: 'test' },
    });
  });

  it('should boot from backup', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: 'TEST', version: '1.0.0', signature: 'test' } },
        lastUpdated: new Date(),
        isBackup: true,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
      });
    });
    expect(result.current.screen).toBe(SCREENS.MAIN);
    expect(result.current.config.isBackup).toEqual(true);
    expect(result.current.config.data).toEqual({
      meta: { id: 'TEST', version: '1.0.0', signature: 'test' },
    });
  });

  it('should handle error during boot', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: 'TEST', version: '1.0.0', signature: 'test' } },
        lastUpdated: new Date(),
        isBackup: false,
        error: 'Invalid config',
        hasAcceptedTermsAndConditions: false,
      });
    });
    expect(result.current.screen).toBe(SCREENS.INVALID_CONFIG);
    expect(result.current.errorMessage).toBe('Invalid config');
  });

  // ERROR REPORTING
  it('should handle reporting an error', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.reportError('An error occurred'));
    expect(result.current.screen).toBe(SCREENS.ERROR);
    expect(result.current.errorMessage).toBe('An error occurred');
    expect(result.current.isRuntimeError).toBe(true);
  });

  // QUICK NAVIGATION
  test('Should navigate back to main', () => {
    const { result } = renderHook(() => useAppStore());
    [
      SCREENS.MAIN,
      SCREENS.PROCESSING_CANCELLED,
      SCREENS.PROCESSING_FINISHED,
      SCREENS.PROCESSING_FINISHED,
    ].forEach((screen) => {
      result.current.screen = screen;
      act(() => result.current.backToMainScreen());
      expect(result.current.screen).toEqual(SCREENS.MAIN);
    });
  });

  test('Show T&Cs', () => {
    const { result } = renderHook(() => useAppStore());
    [SCREENS.LOAD_NEW_CONFIG, SCREENS.CONFIG_UPDATED].forEach((screen) => {
      result.current.screen = screen;
      act(() => result.current.showTermsAndConditions());
      expect(result.current.screen).toEqual(SCREENS.WELCOME);
    });
  });

  test('Start Config Change', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.startConfigChange());
    expect(result.current.screen).toEqual(SCREENS.CONFIG_CHANGE);
  });

  test('Processing Cancelled', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.processingCancelled());
    expect(result.current.screen).toEqual(SCREENS.PROCESSING_CANCELLED);
  });

  // INTERCOM :: BASICS
  // TODO: Fix mocks for intercomAPI calls
  test('quit the application', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.quit());
    expect(window.electronAPI!.invoke.quit).toHaveBeenCalled();
    resetWindowContext();
  });

  test('open a file', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.openOutputFile('SOME PATH'));
    expect(window.electronAPI!.invoke.openOutputFile).toHaveBeenCalled();
    resetWindowContext();
  });

  test('accept T&Cs', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.acceptTermsAndConditions());
    expect(window.electronAPI!.invoke.acceptTermsAndConditions).toHaveBeenCalled();
    expect(result.current.screen).toEqual(SCREENS.MAIN);
    resetWindowContext();
  });

  // INTERCOM :: CONFIG RELATED
  it('should update the config on updateConfig', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.updateConfig(
        // @ts-ignore
        { meta: { id: 'NEW_REGION', version: '2.0.0', signature: 'new' } },
        false,
      ),
    );
    expect(result.current.config.data).toEqual({
      meta: { id: 'NEW_REGION', version: '2.0.0', signature: 'new' },
    });
    expect(result.current.config.isBackup).toBe(false);
    expect(result.current.config.isInitial).toBe(false);
  });

  it('should handle user config removal', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.removeUserConfig());
    expect(result.current.screen).toBe(SCREENS.LOAD_NEW_CONFIG);
  });

  it('should handle loading new config', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.loadNewConfig());
    expect(result.current.screen).toBe(SCREENS.LOAD_NEW_CONFIG);
  });

  it('should handle load new config done', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.loadNewConfig();
      result.current.loadNewConfigDone({
        success: true,
        cancelled: false,
        error: undefined,
        // @ts-ignore
        config: { meta: { id: 'LOADED', version: '1.0.0', signature: 'loaded' } },
        lastUpdated: new Date(),
      });
    });
    expect(result.current.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(result.current.config.data).toEqual({
      meta: { id: 'LOADED', version: '1.0.0', signature: 'loaded' },
    });
  });

  it('should handle user config removed successfully', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.userConfigRemoved({
        success: true,
        error: undefined,
        // @ts-ignore
        config: { meta: { id: 'NEW_CONFIG', version: '1.0.0', signature: 'new' } },
        lastUpdated: new Date(),
      }),
    );
    expect(result.current.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(result.current.config.data).toEqual({
      meta: { id: 'NEW_CONFIG', version: '1.0.0', signature: 'new' },
    });
  });

  it('should handle user config removal failure', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.userConfigRemoved({
        success: false,
        error: 'Failed to remove config',
        // @ts-ignore
        config: null,
        lastUpdated: new Date(),
      }),
    );
    expect(result.current.screen).toBe(SCREENS.ERROR);
    expect(result.current.errorMessage).toBe(
      'Error in the backup configuration file:\nFailed to remove config',
    );
  });

  // INTERCOM :: PREROCESSING RELATED
  it('should open a file dialogue', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.preProcessFileOpenDialog());
    expect(window.electronAPI!.invoke.preProcessFileOpenDialog).toHaveBeenCalled();
    expect(result.current.screen).toEqual(SCREENS.FILE_LOADING);
    resetWindowContext();
  });

  it('should start preprocessing a file', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.startPreProcessingFile('TEST_PATH'));
    expect(window.electronAPI!.invoke.fileDropped).toHaveBeenCalled();
    resetWindowContext();
  });

  it('should handle pre-processing done successfully', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.preProcessingDone({
        isValid: true,
        isMappingDocument: false,
        // @ts-ignore
        document: { /* mock document data */ },
        inputFilePath: 'path/to/input',
        errorFilePath: '',
      }),
    );
    expect(result.current.screen).toBe(SCREENS.VALIDATION_SUCCESS);
    expect(result.current.inputFilePath).toBe('path/to/input');
  });

  it('should handle pre-processing failure', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.preProcessingDone({
        isValid: false,
        isMappingDocument: false,
        // @ts-ignore
        document: null,
        inputFilePath: 'path/to/input',
        errorFilePath: 'path/to/error',
      }),
    );
    expect(result.current.screen).toBe(SCREENS.VALIDATION_FAILED);
    expect(result.current.inputFilePath).toBe('path/to/input');
    expect(result.current.errorFilePath).toBe('path/to/error');
  });

  // INTERCOM :: PROCESSING RELATED
  it('should start processing the file', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.startProcessingFile('TEST_PATH_A', 'TEST_PATH_B'));
    expect(result.current.screen).toEqual(SCREENS.PROCESSING_IN_PROGRESS);
    expect(result.current.inputFilePath).toEqual('TEST_PATH_A');
  });

  it('should handle processing file successfully', () => {
    const { result } = renderHook(() => useAppStore());
    act(() =>
      result.current.processingDone({
        // @ts-ignore
        docuement: {},
        isMappingDocument: false,
        outputFilePath: 'TEST_PATH_A',
        mappingFilePath: 'TEST_PATH_B',
      }),
    );
    expect(result.current.isMappingDocument).toEqual(false);
    expect(result.current.screen).toEqual(SCREENS.PROCESSING_FINISHED);
    expect(result.current.outputFilePath).toEqual('TEST_PATH_A');
    expect(result.current.mappingFilePath).toEqual('TEST_PATH_B');
  });

  it('should handle processing file failure', () => {
    // TODO: add failure scenario once store exposes the error branch for processing
    // Example:
    // const { result } = renderHook(() => useAppStore());
    // act(() => result.current.processingDone({ isMappingDocument: false, error: 'boom' }));
    // expect(result.current.screen).toEqual(SCREENS.ERROR);
    // expect(result.current.errorMessage).toEqual('boom');
  });
});

function setWindowContext() {
  const w = globalThis.window as Window;
  (w as any).electronAPI = {
    invoke: {
      getFilePath: vi.fn<any>(),
      getPosixFilePath: vi.fn<any>(),
      requestConfigUpdate: vi.fn<any>(),
      loadNewConfig: vi.fn<any>(),
      removeUserConfig: vi.fn<any>(),
      acceptTermsAndConditions: vi.fn<any>(),
      preProcessFileOpenDialog: vi.fn<any>(),
      fileDropped: vi.fn<any>(),
      processFile: vi.fn<any>(),
      openOutputFile: vi.fn<any>(),
      quit: vi.fn<any>(),
    },
    on: {
      error: vi.fn<any>(),
      configChanged: vi.fn<any>(),
      processingDone: vi.fn<any>(),
      preprocessingDone: vi.fn<any>(),
      processingCancelled: vi.fn<any>(),
    },
  };
}

function resetWindowContext() {
  const w = globalThis.window as Window;
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  w.electronAPI = undefined;
}
