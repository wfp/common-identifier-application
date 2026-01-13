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
import log from 'electron-log/renderer';
import type {
  ILoadSystemConfig,
  ILoadNewConfig,
  IRemoveConfig,
  IValidationDone,
  IProcessingDone,
  IEncryptionDone,
} from '../../common/types';
import { EVENT } from '../../common/events';
import type { Api } from '../../common/api';

const logger = log.scope('renderer:ipc');

function assertElectron(win: Window, label: string): asserts win is Window & { electronAPI: Api } {
  if (typeof (win as any).electronAPI !== 'object') {
    logger.warn(`Cannot call ${label} - Electron API not available`);
    throw new Error(`Electron API not available - cannot call ${label}`);
  }
}

async function invoke<T>(label: string, fn: () => Promise<T>): Promise<T> {
  assertElectron(window, label);
  try { return await fn() }
  catch (err) {
    logger.error(`Invoke(${label}) failed:`, err);
    throw err;
  }
}

// INVOKES
export const loadSystemConfig = async (): Promise<ILoadSystemConfig> => {
  logger.debug(`Invoke: ${EVENT.CONFIG_LOAD_SYSTEM}`);
  return invoke(EVENT.CONFIG_LOAD_SYSTEM, () => window.electronAPI.invoke.loadSystemConfig());
}

export const loadNewConfig = async (): Promise<ILoadNewConfig> => {
  logger.debug(`Invoke: ${EVENT.CONFIG_LOAD_NEW}`);
  return invoke(EVENT.CONFIG_LOAD_NEW, () => window.electronAPI.invoke.loadNewConfig());
}

export const removeConfig = async (): Promise<IRemoveConfig> => {
  logger.debug(`Invoke: ${EVENT.CONFIG_REMOVE}`);
  return invoke(EVENT.CONFIG_REMOVE, () => window.electronAPI.invoke.removeConfig());
}

export const validateFileDropped = async (filePath: string): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.VALIDATION_START_DROP}`);
  return invoke(EVENT.VALIDATION_START_DROP, async () => window.electronAPI.invoke.validateFileDropped(filePath));
}

export const validateFileOpenDialogue = async (): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.VALIDATION_START_DIALOGUE}`);
  return invoke(EVENT.VALIDATION_START_DIALOGUE, async () => window.electronAPI.invoke.validateFileOpenDialogue());
}

export const processFile = async (filePath: string): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.PROCESSING_START}`);
  return invoke(EVENT.PROCESSING_START, async () => window.electronAPI.invoke.processFile(filePath));
}

export const encryptFile = async (filePath: string): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.ENCRYPTION_START}`);
  return invoke(EVENT.ENCRYPTION_START, async () => window.electronAPI.invoke.encryptFile(filePath));
}

export const openOutputFile = async (filePath: string): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.OPEN_OUTPUT_FILE}`);
  return invoke(EVENT.OPEN_OUTPUT_FILE, async () => window.electronAPI.invoke.openOutputFile(filePath));
}

export const revealInDirectory = async (dirPath: string): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.REVEAL_IN_DIRECTORY}`);
  return invoke(EVENT.REVEAL_IN_DIRECTORY, async () => window.electronAPI.invoke.revealInDirectory(dirPath));
}

export const acceptTermsAndConditions = async (): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.ACCEPT_TERMS_AND_CONDITIONS}`);
  return invoke(EVENT.ACCEPT_TERMS_AND_CONDITIONS, async () => window.electronAPI.invoke.acceptTermsAndConditions());
}

export const quit = async (): Promise<void> => {
  logger.debug(`Invoke: ${EVENT.QUIT}`);
  return invoke(EVENT.QUIT, async () => window.electronAPI.invoke.quit());
}

export const getFilePath = async (file: File): Promise<string | undefined> => {
  logger.debug(`Invoke: ${EVENT.GET_FILE_PATH}`);
  return invoke(EVENT.GET_FILE_PATH, async () => window.electronAPI.invoke.getFilePath(file));
}

export const getPosixFilePath = async (file: File): Promise<string | undefined> => {
  logger.debug(`Invoke: ${EVENT.GET_POSIX_FILE_PATH}`);
  return invoke(EVENT.GET_POSIX_FILE_PATH, async () => window.electronAPI.invoke.getPosixFilePath(file));
}


// EVENT LISTENERS
type Unsubscribe = () => void;

export const on = {
  validationDone(handler: (_evt: unknown, value: IValidationDone) => void): Unsubscribe {
    window.electronAPI.on.validationDone(handler);
    return () => window.electronAPI.invoke.unsubscribe(EVENT.VALIDATION_FINISHED, handler);
  },

  processingDone(handler: (_evt: unknown, value: IProcessingDone) => void): Unsubscribe {
    window.electronAPI.on.processingDone(handler);
    return () => window.electronAPI.invoke.unsubscribe(EVENT.PROCESSING_FINISHED, handler);
  },

  encryptionDone(handler: (_evt: unknown, value: IEncryptionDone) => void): Unsubscribe {
    window.electronAPI.on.encryptionDone(handler);
    return () => window.electronAPI.invoke.unsubscribe(EVENT.ENCRYPTION_FINISHED, handler);
  },

  processingCancelled(handler: (_evt: unknown) => void): Unsubscribe {
    window.electronAPI.on.processingCancelled(handler);
    return () => window.electronAPI.invoke.unsubscribe(EVENT.WORKFLOW_CANCELLED, handler);
  },

  error(handler: (_evt: unknown, message: string) => void): Unsubscribe {
    window.electronAPI.on.error(handler);
    return () => window.electronAPI.invoke.unsubscribe(EVENT.ERROR, handler);
  },
};

export type Subscriptions = {
  validationDone?: (_evt: unknown, value: IValidationDone) => void;
  processingDone?: (_evt: unknown, value: IProcessingDone) => void;
  encryptionDone?: (_evt: unknown, value: IEncryptionDone) => void;
  processingCancelled?: (_evt: unknown) => void;
  error?: (_evt: unknown, message: string) => void;
};

export function registerSubscriptions(handlers: Subscriptions): Unsubscribe[] {
  const unsubs: Unsubscribe[] = [];
  if (handlers.validationDone) unsubs.push(on.validationDone(handlers.validationDone));
  if (handlers.processingDone) unsubs.push(on.processingDone(handlers.processingDone));
  if (handlers.encryptionDone) unsubs.push(on.encryptionDone(handlers.encryptionDone));
  if (handlers.processingCancelled) unsubs.push(on.processingCancelled(handlers.processingCancelled));
  if (handlers.error) unsubs.push(on.error(handlers.error));
  return unsubs;
}
