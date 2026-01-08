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
import type {
  IRequestConfigUpdate,
  ILoadNewConfig,
  IRemoveUserConfig,
  IPreProcessingDone,
  IProcessingDone,
} from '../../common/types';
import { EVENT } from '../../common/events';

function hasElectron(): boolean {
  return typeof (window as any).electronAPI === 'object';
}

function logNoElectron(label: string) {
  console.warn(`[IPC] Cannot call ${label} - Electron API not available`);
}

async function invoke<T>(label: string, fn: () => Promise<T>): Promise<T> {
  if (!hasElectron()) {
    logNoElectron(label);
    // @ts-expect-error intentioal undefined return
    return undefined;
  }
  try { return await fn() }
  catch (err) {
    console.error(`[IPC] invoke(${label}) failed:`, err);
    throw err;
  }
}

// INVOKES
export const requestConfigUpdate = async (): Promise<IRequestConfigUpdate> => 
  invoke(EVENT.CONFIG_REQUEST_UPDATE, () => (window as any).electronAPI.invoke.requestConfigUpdate());

export const loadNewConfig = async (): Promise<ILoadNewConfig> =>
  invoke(EVENT.CONFIG_LOAD_NEW, () => (window as any).electronAPI.invoke.loadNewConfig());

export const removeUserConfig = async (): Promise<IRemoveUserConfig> =>
  invoke(EVENT.CONFIG_REMOVE, () => (window as any).electronAPI.invoke.removeUserConfig());

export const fileDropped = async (filePath: string): Promise<void> =>
  invoke(EVENT.PREPROCESSING_START_DROP, () => (window as any).electronAPI.invoke.fileDropped(filePath));

export const preProcessFileOpenDialog = async (): Promise<void> =>
  invoke(EVENT.PREPROCESSING_START_DIALOGUE, () => (window as any).electronAPI.invoke.preProcessFileOpenDialog());

export const processFile = async (filePath: string): Promise<void> =>
  invoke(EVENT.PROCESSING_START, () => (window as any).electronAPI.invoke.processFile(filePath));

export const openOutputFile = async (filePath: string): Promise<void> =>
  invoke(EVENT.OPEN_OUTPUT_FILE, () => (window as any).electronAPI.invoke.openOutputFile(filePath));

export const acceptTermsAndConditions = async (): Promise<void> =>
  invoke(EVENT.ACCEPT_TERMS_AND_CONDITIONS, () => (window as any).electronAPI.invoke.acceptTermsAndConditions());

export const quit = async (): Promise<void> =>
  invoke(EVENT.QUIT, () => (window as any).electronAPI.invoke.quit());

export const getFilePath = async (file: File): Promise<string | undefined> =>
  invoke("GET_FILE_PATH", () => (window as any).electronAPI.invoke.getFilePath(file));

export const getPosixFilePath = async (file: File): Promise<string | undefined> =>
  invoke("GET_POSIX_FILE_PATH", () => (window as any).electronAPI.invoke.getPosixFilePath(file));


// EVENT LISTENERS
type Unsubscribe = () => void;

export const on = {
  preprocessingDone(handler: (_evt: unknown, value: IPreProcessingDone) => void): Unsubscribe {
    if (!hasElectron()) {
      logNoElectron(EVENT.PREPROCESSING_FINISHED);
      return () => {};
    }
    const api = (window as any).electronAPI.on;
    api.preprocessingDone(handler);
    return () => api.off?.preprocessingDone?.(handler) ?? (window as any).electronAPI.removeListener?.('preprocessingDone', handler);
  },

  processingDone(handler: (_evt: unknown, value: IProcessingDone) => void): Unsubscribe {
    if (!hasElectron()) {
      logNoElectron(EVENT.PROCESSING_FINISHED);
      return () => {};
    }
    const api = (window as any).electronAPI.on;
    api.processingDone(handler);
    return () => api.off?.processingDone?.(handler) ?? (window as any).electronAPI.removeListener?.('processingDone', handler);
  },

  configChanged(handler: (_evt: unknown, payload: { config: any; isBackup: boolean }) => void): Unsubscribe {
    if (!hasElectron()) {
      logNoElectron(EVENT.CONFIG_CHANGED);
      return () => {};
    }
    const api = (window as any).electronAPI.on;
    api.configChanged(handler);
    return () => api.off?.configChanged?.(handler) ?? (window as any).electronAPI.removeListener?.('configChanged', handler);
  },

  processingCancelled(handler: (_evt: unknown) => void): Unsubscribe {
    if (!hasElectron()) {
      logNoElectron(EVENT.WORKFLOW_CANCELLED);
      return () => {};
    }
    const api = (window as any).electronAPI.on;
    api.processingCancelled(handler);
    return () => api.off?.processingCancelled?.(handler) ?? (window as any).electronAPI.removeListener?.('processingCancelled', handler);
  },

  error(handler: (_evt: unknown, message: string) => void): Unsubscribe {
    if (!hasElectron()) {
      logNoElectron(EVENT.ERROR);
      return () => {};
    }
    const api = (window as any).electronAPI.on;
    api.error(handler);
    return () => api.off?.error?.(handler) ?? (window as any).electronAPI.removeListener?.('error', handler);
  },
};

export type Subscriptions = {
  preprocessingDone?: (_evt: unknown, value: IPreProcessingDone) => void;
  processingDone?: (_evt: unknown, value: IProcessingDone) => void;
  configChanged?: (_evt: unknown, payload: { config: any; isBackup: boolean }) => void;
  processingCancelled?: (_evt: unknown) => void;
  error?: (_evt: unknown, message: string) => void;
};

export function registerSubscriptions(handlers: Subscriptions): Unsubscribe[] {
  const unsubs: Unsubscribe[] = [];
  if (handlers.preprocessingDone) unsubs.push(on.preprocessingDone(handlers.preprocessingDone));
  if (handlers.processingDone) unsubs.push(on.processingDone(handlers.processingDone));
  if (handlers.configChanged) unsubs.push(on.configChanged(handlers.configChanged));
  if (handlers.processingCancelled) unsubs.push(on.processingCancelled(handlers.processingCancelled));
  if (handlers.error) unsubs.push(on.error(handlers.error));
  return unsubs;
}
