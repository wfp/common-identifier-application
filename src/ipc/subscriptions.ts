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
import { registerSubscriptions } from './intercom-bridge';
import { useAppStore } from '../store';
import log from 'electron-log';
import { EVENT } from '../../common/events';

const logger = log.scope('renderer:ipc');

export function registerIpcSubscriptions() {
  logger.debug('Registering IPC Subscriptions');
  return registerSubscriptions({
    preprocessingDone: (_e, value) => { 
      logger.debug(`Event: ${EVENT.PREPROCESSING_FINISHED}`);
      return useAppStore.getState().endPreprocessing(value)
    },
    processingDone: (_e, value) => {
      logger.debug(`Event: ${EVENT.PROCESSING_FINISHED}`);
      return useAppStore.getState().endProcessing(value)
    },
    configChanged: (_e, { config, isBackup }) => {
      logger.debug(`Event: ${EVENT.CONFIG_CHANGED}`);
      return useAppStore.getState().setConfig(config, isBackup)
    },
    processingCancelled: () => {
      logger.debug(`Event: ${EVENT.WORKFLOW_CANCELLED}`);
      return useAppStore.getState().cancelWorkflow()
    },
    error: (_e, message) => {
      logger.debug(`Event: ${EVENT.ERROR}`);
      return useAppStore.getState().showError(message, true)
    },
  });
}
