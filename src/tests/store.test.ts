/**
 * @jest-environment jsdom
 */
import { act, renderHook } from '@testing-library/react';
import { useAppStore } from '../store';
import { SCREENS } from '../../common/screens';
import * as intercomApi from '../intercomApi';
import { jest, describe, expect, test, it } from '@jest/globals'

describe('useAppStore', () => {

  // BOOT AND INITIAL STATES

  it('should initialize with the correct default state', () => {
    const { result } = renderHook(() => useAppStore());

    expect(result.current.screen).toBe(SCREENS.BOOT);
    expect(result.current.config.isInitial).toBe(true);
    expect(result.current.config.isBackup).toBe(false);
    expect(result.current.config.data).toEqual({ meta: { id: "UNKNOWN", version: "0.0.0", signature: "" } });
  });

  it('should update the config and screen on boot', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: "TEST", version: "1.0.0", signature: "test" } },
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
      });
    });

    expect(result.current.screen).toBe(SCREENS.MAIN);
    expect(result.current.config.isBackup).toEqual(false);
    expect(result.current.config.data).toEqual({ meta: { id: "TEST", version: "1.0.0", signature: "test" } });
  });

  it('should show the T&Cs if not already accepted', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: "TEST", version: "1.0.0", signature: "test" } },
        lastUpdated: new Date(),
        isBackup: false,
        error: undefined,
        hasAcceptedTermsAndConditions: false,
      });
    });

    expect(result.current.screen).toBe(SCREENS.WELCOME);
    expect(result.current.config.isBackup).toEqual(false);
    expect(result.current.config.data).toEqual({ meta: { id: "TEST", version: "1.0.0", signature: "test" } });
  });

  it('should boot from backup', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: "TEST", version: "1.0.0", signature: "test" } },
        lastUpdated: new Date(),
        isBackup: true,
        error: undefined,
        hasAcceptedTermsAndConditions: true,
      });
    });

    expect(result.current.screen).toBe(SCREENS.MAIN);
    expect(result.current.config.isBackup).toEqual(true);
    expect(result.current.config.data).toEqual({ meta: { id: "TEST", version: "1.0.0", signature: "test" } });
  });

  it('should handle error during boot', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => {
      result.current.boot({
        // @ts-ignore
        config: { meta: { id: "TEST", version: "1.0.0", signature: "test" } },
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
      SCREENS.PROCESSING_FINISHED
    ].forEach((screen) => {
      result.current.screen = screen;
      act(() => result.current.backToMainScreen());
      expect(result.current.screen).toEqual(SCREENS.MAIN)
    });
  });

  test('Show T&Cs', () => {
    const { result } = renderHook(() => useAppStore());
    [
      SCREENS.LOAD_NEW_CONFIG,
      SCREENS.CONFIG_UPDATED,
    ].forEach((screen) => {
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
    expect(window.electronAPI.invoke.quit).toHaveBeenCalled();
    resetWindowContext();
  });

  test('open a file', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.openOutputFile("SOME PATH"));
    expect(window.electronAPI.invoke.openOutputFile).toHaveBeenCalled();
    resetWindowContext();
  });

  test('accept T&Cs', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.acceptTermsAndConditions());
    expect(window.electronAPI.invoke.acceptTermsAndConditions).toHaveBeenCalled();
    expect(result.current.screen).toEqual(SCREENS.MAIN);
    resetWindowContext();
  });

  // INTERCOM :: CONFIG RELATED

  it('should update the config on updateConfig', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.updateConfig(
        // @ts-ignore
        { meta: { id: "NEW_REGION", version: "2.0.0", signature: "new" } },
        false
    ));

    expect(result.current.config.data).toEqual({ meta: { id: "NEW_REGION", version: "2.0.0", signature: "new" } });
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
        config: { meta: { id: "LOADED", version: "1.0.0", signature: "loaded" } },
        lastUpdated: new Date(),
      })
    });

    expect(result.current.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(result.current.config.data).toEqual({ meta: { id: "LOADED", version: "1.0.0", signature: "loaded" } });
  });

  it('should handle user config removed successfully', () => {
    const { result } = renderHook(() => useAppStore());

    act(() => result.current.userConfigRemoved({
        success: true,
        error: undefined,
        // @ts-ignore
        config: { meta: { id: "NEW_CONFIG", version: "1.0.0", signature: "new" } },
        lastUpdated: new Date(),
      })
    );
    expect(result.current.screen).toBe(SCREENS.CONFIG_UPDATED);
    expect(result.current.config.data).toEqual({ meta: { id: "NEW_CONFIG", version: "1.0.0", signature: "new" } });
  });

  it('should handle user config removal failure', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.userConfigRemoved({
      success: false,
      error: 'Failed to remove config',
      // @ts-ignore
      config: null,
      lastUpdated: new Date(),
    }));

    expect(result.current.screen).toBe(SCREENS.ERROR);
    expect(result.current.errorMessage).toBe('Error in the backup configuration file:\nFailed to remove config');
  });

  // INTERCOM :: PREROCESSING RELATED

  it('should open a file dialogue', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.preProcessFileOpenDialog());
    expect(window.electronAPI.invoke.preProcessFileOpenDialog).toHaveBeenCalled();
    expect(result.current.screen).toEqual(SCREENS.FILE_LOADING);
    resetWindowContext();
  });

  it('should start preprocessing a file', () => {
    setWindowContext();
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.startPreProcessingFile("TEST_PATH"));
    expect(window.electronAPI.invoke.fileDropped).toHaveBeenCalled();
    resetWindowContext();
  });

  it('should handle pre-processing done successfully', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.preProcessingDone({
        isValid: true,
        isMappingDocument: false,
        // @ts-ignore
        document: { /* mock document data */ },
        inputFilePath: 'path/to/input',
        errorFilePath: "",
      }));

    expect(result.current.screen).toBe(SCREENS.VALIDATION_SUCCESS);
    expect(result.current.inputFilePath).toBe('path/to/input');
  });

  it('should handle pre-processing failure', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.preProcessingDone({
      isValid: false,
      isMappingDocument: false,
      // @ts-ignore
      document: null,
      inputFilePath: 'path/to/input',
      errorFilePath: 'path/to/error',
    }));

    expect(result.current.screen).toBe(SCREENS.VALIDATION_FAILED);
    expect(result.current.inputFilePath).toBe('path/to/input');
    expect(result.current.errorFilePath).toBe('path/to/error');
  });

  // INTERCOM :: PROCESSING RELATED

  it('should start processing the file', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.startProcessingFile("TEST_PATH_A", "TEST_PATH_B"));
    expect(result.current.screen).toEqual(SCREENS.PROCESSING_IN_PROGRESS);
    expect(result.current.inputFilePath).toEqual("TEST_PATH_A");
  });

  it('should handle processing file successfully', () => {
    const { result } = renderHook(() => useAppStore());
    act(() => result.current.processingDone({
      // @ts-ignore
      docuement: {},
      isMappingDocument: false,
      outputFilePath: "TEST_PATH_A",
      mappingFilePath: "TEST_PATH_B"
    }));
    expect(result.current.isMappingDocument).toEqual(false);
    expect(result.current.screen).toEqual(SCREENS.PROCESSING_FINISHED);
    expect(result.current.outputFilePath).toEqual("TEST_PATH_A");
    expect(result.current.mappingFilePath).toEqual("TEST_PATH_B");
  });
  it('should handle processing file failure', () => {});
});

function setWindowContext() {
  global.window = Object.create(window);
  global.window.electronAPI = {
    invoke: {
      getFilePath: jest.fn<any>(),
      getPosixFilePath: jest.fn<any>(),
      requestConfigUpdate: jest.fn<any>(),
      loadNewConfig: jest.fn<any>(),
      removeUserConfig: jest.fn<any>(),
      acceptTermsAndConditions: jest.fn<any>(),
      preProcessFileOpenDialog: jest.fn<any>(),
      fileDropped: jest.fn<any>(),
      processFile: jest.fn<any>(),
      openOutputFile: jest.fn<any>(),
      quit: jest.fn<any>(),
    },
    on: {
      error: jest.fn<any>(),
      configChanged: jest.fn<any>(),
      processingDone: jest.fn<any>(),
      preprocessingDone: jest.fn<any>(),
      processingCancelled: jest.fn<any>(),
    }
  };
}

function resetWindowContext() {
  // @ts-ignore
  global.window.electronAPI = undefined;
}