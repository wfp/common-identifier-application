import type { GetApiType } from "electron-typescript-ipc";

// TODO: actual return types for these functions
export type Api = GetApiType<
  {
    acceptTermsAndConditions: () => void;
    requestConfigUpdate: () => Promise<any>;
    loadNewConfig: () => Promise<any>;
    removeUserConfig: () => Promise<any>;
    fileDropped: (fileName: string) => Promise<void>;
    processFile: (filename: string) => Promise<void>,
    preProcessFileOpenDialog: () => Promise<void>,
    openOutputFile: (filename: string) => Promise<void>,
    quit: () => void;
  },
  {
    error: (errorMessage: string) => Promise<void>,
    configChanged: (newConfig: any) => Promise<void>
    preprocessingDone: (value: any) => Promise<void>,
    processingDone: (value: any) => Promise<void>,
    processingCancelled: () => Promise<void>;
  }
>